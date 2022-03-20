DROP PROCEDURE IF EXISTS CalculateRating;
DELIMITER $$ 
CREATE PROCEDURE CalculateRating(type_id INT, rating_type VARCHAR(5), OUT id INT, OUT average DECIMAL(3,2))
BEGIN
	CASE rating_type
		WHEN 'guide' THEN 
			SELECT guide_id INTO id FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = type_id;
		    SELECT ROUND(AVG(guide_rating.rating),2) INTO average FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id JOIN guide ON schedule.guide_id = guide.guide_id WHERE guide.guide_id = id;
        WHEN 'tour' THEN 
			SELECT tour_id INTO id FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id WHERE tour_rating_id = type_id;
			SELECT ROUND(AVG(tour_rating.rating),2) INTO average FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id JOIN tour ON schedule.tour_id = tour.tour_id WHERE tour.tour_id = id;
    END CASE;
END $$
DELIMITER ;

    
DROP PROCEDURE IF EXISTS PaginateSort;
DELIMITER $$ 
-- starts with page 0
CREATE PROCEDURE PaginateSort(tablename CHAR(30), sortcolumn CHAR(20), direction CHAR(4), size INT, page INT)
BEGIN
	SET @sql = CONCAT('SELECT * FROM ', tablename, ' ORDER BY ', sortcolumn,' ', direction, ' LIMIT ', size, ' OFFSET ', page * size);
    PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;
END $$
DELIMITER ;   
    
DROP PROCEDURE IF EXISTS ScheduleBetweenDates;
DELIMITER $$ 
CREATE PROCEDURE ScheduleBetweenDates(IN start_date DATE, IN end_date DATE)
BEGIN
	SET @sql = CONCAT('SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id WHERE schedule.schedule_date_time BETWEEN "', start_date, '" AND "', end_date,'"');
    PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;
END $$
DELIMITER ;    

DROP FUNCTION IF EXISTS DeleteOldCustomers;
DELIMITER $$ 
CREATE FUNCTION DeleteOldCustomers()
RETURNS INT
READS SQL DATA
BEGIN
	DECLARE quantity INT;
    SET quantity = (SELECT COUNT(customer_id) FROM customer);
    DELETE FROM customer WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM booking) AND password IS NULL;
    SET quantity = quantity - (SELECT COUNT(customer_id) FROM customer);
    RETURN quantity;
END $$

DROP TRIGGER IF EXISTS update_guide_rating;
DELIMITER $$
CREATE TRIGGER update_guide_rating
	AFTER INSERT ON guide_rating
	FOR EACH ROW BEGIN
		DECLARE average DECIMAL(3,2);
        DECLARE id DECIMAL(3,2);
        CALL CalculateRating(NEW.guide_rating_id, 'guide', @id, @average);
		UPDATE guide SET guide.rating = @average WHERE guide_id = @id;
	END $$
DELIMITER ;

DROP TRIGGER IF EXISTS update_tour_rating;
DELIMITER $$
CREATE TRIGGER update_tour_rating
	AFTER INSERT ON tour_rating
	FOR EACH ROW BEGIN
		DECLARE average DECIMAL(3,2);
        DECLARE id DECIMAL(3,2);
        CALL CalculateRating(NEW.tour_rating_id, 'tour', @id, @average);
		UPDATE tour SET tour.rating = @average WHERE tour_id = @id;
	END $$
DELIMITER ;

-- booking total_price based on amount of people
DROP TRIGGER IF EXISTS update_total_price;
DELIMITER $$
CREATE TRIGGER update_total_price
	BEFORE INSERT ON booking
	FOR EACH ROW BEGIN
		SET NEW.total_price = ((SELECT t.price FROM schedule JOIN tour AS t ON schedule.tour_id = t.tour_id WHERE schedule.schedule_id = NEW.schedule_id LIMIT 1) * NEW.number_of_spots);
    END $$ 
DELIMITER ;

-- works
DROP TRIGGER IF EXISTS update_number_of_spots;
DELIMITER $$
CREATE TRIGGER update_number_of_spots
	BEFORE INSERT ON booking
	FOR EACH ROW BEGIN
		DECLARE free_spots INT;
        SET free_spots = (SELECT number_of_free_spots FROM schedule WHERE schedule.schedule_id = NEW.schedule_id);
		IF (free_spots >= NEW.number_of_spots) THEN 
			UPDATE schedule SET number_of_free_spots = free_spots - NEW.number_of_spots
			WHERE schedule_id = NEW.schedule_id;
		ELSE 
			SIGNAL SQLSTATE '45000' 
			SET MESSAGE_TEXT = "ERROR: Not enough free spots";
		END IF;
	END $$ 
DELIMITER ;

DROP TRIGGER IF EXISTS set_number_of_spots;
DELIMITER $$
CREATE TRIGGER set_number_of_spots
	BEFORE INSERT ON schedule
	FOR EACH ROW BEGIN
		SET NEW.number_of_free_spots = (SELECT number_of_spots FROM tour WHERE tour_id = NEW.tour_id);
	END $$ 
DELIMITER ;

DROP TRIGGER IF EXISTS check_booking_insert;
DELIMITER $$
CREATE TRIGGER check_booking_insert
	BEFORE INSERT ON booking
	FOR EACH ROW BEGIN
		DECLARE start_date DATETIME;
        SET start_date = (SELECT schedule_date_time FROM schedule WHERE schedule.schedule_id = NEW.schedule_id);
		IF (start_date <= NEW.booking_date_time) THEN 
			SIGNAL SQLSTATE '45000' 
			SET MESSAGE_TEXT = "ERROR: You cannot book schedules from the past.";
		END IF;
	END $$
DELIMITER ;

DROP TRIGGER IF EXISTS tour_change_is_active;
DELIMITER $$
CREATE TRIGGER tour_change_is_active
	AFTER DELETE ON place
	FOR EACH ROW BEGIN
		UPDATE tour set is_active = 0 
        WHERE tour.place_of_departure_id = OLD.place_id AND tour.place_of_destination_id = OLD.place_id;
	END $$ 
DELIMITER ;

DROP TRIGGER IF EXISTS delete_guide_ratings;
DELIMITER $$
CREATE TRIGGER delete_guide_ratings
	BEFORE DELETE ON guide
	FOR EACH ROW BEGIN
		DELETE FROM guide_rating WHERE guide_rating.schedule_id IN (SELECT schedule.schedule_id FROM schedule WHERE schedule.guide_id = OLD.guide_id);
	END $$ 
DELIMITER ;

DROP TRIGGER IF EXISTS delete_tour_ratings;
DELIMITER $$
CREATE TRIGGER delete_tour_ratings
	BEFORE DELETE ON tour
	FOR EACH ROW BEGIN
		DELETE FROM tour_rating WHERE tour_rating.schedule_id IN (SELECT schedule.schedule_id FROM schedule WHERE schedule.tour_id = OLD.tour_id);
	END $$ 
DELIMITER ;

DROP TRIGGER IF EXISTS set_schedule_tourid_to_defualt;
DELIMITER $$
CREATE TRIGGER set_schedule_tourid_to_defualt
	BEFORE DELETE ON tour
	FOR EACH ROW BEGIN
		UPDATE schedule SET tour_id = DEFAULT WHERE tour_id = OLD.tour_id;
	END $$ 
DELIMITER ;

-- event to delete old bookings
DROP EVENT IF EXISTS delete_old_schedules;
DELIMITER $$
CREATE EVENT delete_old_schedules ON SCHEDULE EVERY 1 YEAR
STARTS '2022-01-01' ENDS '2035-01-01'
DO BEGIN 
	DELETE FROM schedule WHERE schedule_date_time < NOW() - INTERVAL 5 YEAR;
END $$
DELIMITER ;

DROP EVENT IF EXISTS delete_old_customer;
DELIMITER $$
CREATE EVENT delete_old_customer ON SCHEDULE EVERY 1 YEAR
STARTS '2022-01-01' ENDS '2035-01-01'
DO BEGIN 
	CALL DeleteOldCustomers();
END $$
DELIMITER ;

DROP EVENT IF EXISTS delete_old_guide;
DELIMITER $$
CREATE EVENT delete_old_guide ON SCHEDULE EVERY 1 YEAR
STARTS '2022-01-01' ENDS '2035-01-01'
DO BEGIN 
	DELETE FROM guide WHERE contract_end_date < NOW() - INTERVAL 5 YEAR;
END $$
DELIMITER ;


CREATE OR REPLACE VIEW tour_place_schedule AS
	SELECT place.place_name AS destination, tour.price, tour.description, tour.rating, 
			schedule.number_of_free_spots, schedule.schedule_date_time,
            guide.first_name, guide.last_name
    FROM tour 
		JOIN place ON tour.place_of_departure_id = place.place_id
        JOIN schedule ON tour.tour_id = schedule.tour_id
        JOIN guide ON schedule.guide_id = guide.guide_id;   
    
CREATE OR REPLACE VIEW tour_rating_view AS
	SELECT place.place_name AS destination, tour.price, tour.description, tour.rating AS "full rating", 
			schedule.schedule_date_time,
            tour_rating.rating, tour_rating.comment
    FROM tour 
		JOIN place ON tour.place_of_departure_id = place.place_id
        JOIN schedule ON tour.tour_id = schedule.tour_id
        JOIN tour_rating ON schedule.schedule_id = tour_rating.schedule_id
	ORDER BY tour.tour_id;
        
CREATE OR REPLACE VIEW guide_rating_view AS
	SELECT guide.first_name, guide.last_name, guide.rating AS "full rating",
			place.place_name AS destination, tour.description, 
			schedule.schedule_date_time,
            guide_rating.rating, guide_rating.comment
    FROM guide 
        JOIN schedule ON guide.guide_id = schedule.guide_id
		JOIN tour ON tour.tour_id = schedule.tour_id
		JOIN place ON tour.place_of_departure_id = place.place_id
        JOIN guide_rating ON schedule.schedule_id = guide_rating.schedule_id;
        
EXPLAIN SELECT * FROM schedule WHERE schedule.schedule_date_time > "2025-11-9 9:12:24"; -- 500,33.33
CREATE INDEX idx_date ON schedule (schedule_date_time); -- 76, 100
-- DROP INDEX idx_date ON schedule;

EXPLAIN SELECT * FROM tour WHERE price < 200; -- 500 33.33
CREATE INDEX idx_price ON tour (price); -- 13, 100
-- DROP INDEX idx_price ON tour; 

CREATE INDEX idx_password ON customer (password);
EXPLAIN SELECT password FROM customer WHERE password = '$2b$15$PGfdEXxNY2M.OSsh1mjIFuy9Tg32Z3Cc5QkKPGIW5f.DNVXpGYwOa'; -- HvS77rnNQL2xCD -- 500 before after 1 row

EXPLAIN SELECT tour.price, tour.rating, place.place_name, schedule.schedule_date_time FROM tour JOIN place ON tour.place_of_destination_id = place.place_id JOIN schedule ON schedule.tour_id = tour.tour_id WHERE tour.price < 100;
-- schedule 500 33, tour 1, 100, place 1, 100, schedule 19 100
CREATE INDEX idx_tour_rating_price ON tour (price, rating);
-- DROP INDEX idx_tour_rating_price ON tour;
-- SHOW STATUS LIKE'Last_Query_Cost'; 

EXPLAIN SELECT * FROM tour ORDER BY rating LIMIT 10; -- 500, 33.33,  500 100
-- CREATE INDEX idx_tour_rating ON tour (rating); -- 500, 32.40, 22, 100,   10, 100
-- DROP INDEX idx_rating ON tour;
-- SHOW STATUS LIKE'Last_Query_Cost'; -- 203, 25

-- EXPLAIN SELECT guide_id, rating FROM guide ORDER BY rating LIMIT 10; -- 500, 33.33,  500 100
-- SELECT guide_id, rating FROM guide ORDER BY rating LIMIT 10; 
-- CREATE INDEX idx_guide_rating ON guide (rating);
-- DROP INDEX idx_guide_rating ON guide;
-- index doesnt make sense because we need to also query name and at least phone to have enough info

-- CREATE INDEX idx_is_active ON tour (is_active);
-- EXPLAIN SELECT * FROM tour WHERE is_active = 1; -- HvS77rnNQL2xCD -- 500, 10 before after 1 row
-- not using index cause we have more active ones than inactive ones and query wont use it
-- drop index idx_is_active ON tour;
-- SHOW STATUS LIKE'Last_Query_Cost'; -- 203, 25

EXPLAIN UPDATE tour SET rating = 5 WHERE tour_id = 5; -- 1 100

EXPLAIN SELECT * FROM schedule JOIN tour ON schedule.tour_id = tour.tour_id ORDER BY rating;
-- CREATE INDEX idx_rating ON tour (rating);
EXPLAIN SELECT * FROM schedule JOIN tour ON schedule.tour_id = tour.tour_id JOIN place ON place.place_id = tour.place_of_destination_id ORDER BY place_id;
EXPLAIN SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id;

-- fulltext index
CREATE FULLTEXT INDEX idx_tour_description ON tour(description);
-- select * from tour where match (description) against ('Sed');
-- explain select * from tour where description like '%Sed%';
-- drop index idx_tour_description ON tour;
-- SHOW STATUS LIKE'Last_Query_Cost';