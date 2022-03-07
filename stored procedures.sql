DROP PROCEDURE IF EXISTS CalculateRating;
DELIMITER $$ 
-- CREATE PROCEDURE CalculateRating(type_id INT, rating_type VARCHAR(5))
CREATE PROCEDURE CalculateRating(type_id INT, rating_type VARCHAR(5), OUT id INT, OUT average DECIMAL(3,2))
BEGIN
	/*DECLARE average DECIMAL(3,2);
	SET @sql = CONCAT('SELECT ', rating_type,'_id, ROUND(AVG(rating),2) FROM ', rating_type,'_rating JOIN schedule ON schedule.schedule_id = ',rating_type,'_rating.schedule_id WHERE ',rating_type,'_rating_id = ',type_id);
	PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;*/
    /*DECLARE average DECIMAL(3,2);
    DECLARE id INT;*/
	CASE rating_type
		WHEN 'guide' THEN 
			SELECT guide_id INTO id FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = type_id;
		    SELECT ROUND(AVG(guide_rating.rating),2) INTO average FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id JOIN guide ON schedule.guide_id = guide.guide_id WHERE guide.guide_id = id;
            -- UPDATE guide SET guide.rating = average WHERE guide_id = id;
        WHEN 'tour' THEN 
			SELECT tour_id INTO id FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id WHERE tour_rating_id = type_id;
			SELECT ROUND(AVG(tour_rating.rating),2) INTO average FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id JOIN tour ON schedule.tour_id = tour.tour_id WHERE tour.tour_id = id;
            -- UPDATE tour SET tour.rating = @average WHERE tour_id = @id;
    END CASE;
END $$
DELIMITER ;

/*SELECT schedule.guide_id, ROUND(AVG(rating),2) AS average  FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = 2;

CALL CalculateRating(130, 'guide', @id, @average);
CALL CalculateRating(130, 'guide');*/

DROP TRIGGER IF EXISTS update_guide_rating;
DELIMITER $$
CREATE TRIGGER update_guide_rating
	AFTER INSERT ON guide_rating
	FOR EACH ROW BEGIN
		DECLARE average DECIMAL(3,2);
        DECLARE id DECIMAL(3,2);
        -- CALL CalculateRating(NEW.guide_rating_id, 'guide');
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

/*
SELECT guide_id FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = 507;
SELECT ROUND(AVG(guide_rating.rating),2) FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id JOIN guide ON schedule.guide_id = guide.guide_id WHERE guide.guide_id = 130;
            
SELECT guide_id, ROUND(AVG(rating),2) FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = 507;
SELECT * FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id JOIN guide ON schedule.guide_id = guide.guide_id WHERE guide.guide_id = 130;

SELECT * FROM guide_rating;
INSERT INTO guide_rating (schedule_id, customer_id, rating, comment) VALUES 
(284, 492,5, "amet, dapibus id, blandit at, nisi. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin vel nisl. Quisque fringilla euismod enim. Etiam gravida molestie arcu. Sed");
SELECT guide_id FROM schedule WHERE schedule_id = 284;
SELECT * FROM guide WHERE guide_id = 130;
*/


-- works booking total_price based on amount of people
DROP TRIGGER IF EXISTS update_total_price;
DELIMITER $$
CREATE TRIGGER update_total_price
	BEFORE INSERT ON booking
	FOR EACH ROW BEGIN
		SET NEW.total_price = ((SELECT t.price FROM booking JOIN schedule ON schedule.schedule_id = NEW.schedule_id JOIN tour AS t ON schedule.tour_id = t.tour_id WHERE schedule.schedule_id = NEW.schedule_id AND customer_id = NEW.customer_id LIMIT 1) * NEW.number_of_spots);
	END $$ 
DELIMITER ;

-- SELECT t.price FROM booking JOIN schedule ON schedule.schedule_id = 5 JOIN tour AS t ON schedule.tour_id = t.tour_id LIMIT 1;
-- works
DROP TRIGGER IF EXISTS update_number_of_spots;
DELIMITER $$
CREATE TRIGGER update_number_of_spots
	BEFORE INSERT ON booking
	FOR EACH ROW BEGIN
		DECLARE free_spots INT;
        SET free_spots = (SELECT number_of_free_spaces FROM schedule WHERE schedule.schedule_id = NEW.schedule_id);
		IF (free_spots >= NEW.number_of_spots) THEN 
			UPDATE schedule SET number_of_free_spaces = free_spots - NEW.number_of_spots
			WHERE schedule_id = NEW.schedule_id;
		ELSE 
			SIGNAL SQLSTATE '45000' 
			SET MESSAGE_TEXT = "ERROR: Not enough free spots ";
		END IF;
	END $$ 
DELIMITER ;

-- works
DROP TRIGGER IF EXISTS set_number_of_spots;
DELIMITER $$
CREATE TRIGGER set_number_of_spots
	BEFORE INSERT ON schedule
	FOR EACH ROW BEGIN
		SET NEW.number_of_free_spaces = (SELECT number_of_spots FROM tour WHERE tour_id = NEW.tour_id);
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
			schedule.number_of_free_spaces, schedule.schedule_date_time,
            guide.first_name, guide.last_name
    FROM tour 
		JOIN place ON tour.place_of_departure_id = place.place_id
        JOIN schedule ON tour.tour_id = schedule.tour_id
        JOIN guide ON schedule.guide_id = guide.guide_id;
    
    
DROP PROCEDURE IF EXISTS PaginateSort;
DELIMITER $$ 
-- starts with page 0
CREATE PROCEDURE PaginateSort(tablename CHAR(30), sortcolumn CHAR(20), direction CHAR(4), size INT, page INT)
BEGIN
	SET @sql = CONCAT('SELECT * FROM ', tablename, ' ORDER BY ', sortcolumn,' ', direction, ' LIMIT ', size, ' OFFSET ', page * size);
    PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;
END $$
DELIMITER ;   

CALL PaginateSort('customer', 'first_name', 'ASC', 5, 1);
    
DROP PROCEDURE IF EXISTS ScheduleBetweenDates;
DELIMITER $$ 
CREATE PROCEDURE ScheduleBetweenDates(IN start_date DATE, IN end_date DATE)
BEGIN
	-- SET start_date = str_to_date(start_date, '%YYYY-%MM-DD%');
    -- SET end_date = str_to_date(end_date, '%YYYY-%MM-DD%');
	SET @sql = CONCAT('SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id WHERE schedule.schedule_date_time BETWEEN "', start_date, '" AND "', end_date,'"');
    PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;
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

INSERT INTO booking (number_of_spots, booking_date_time, customer_id, schedule_id) VALUES (5, "2024-4-16 4:40:34", 352, 1);

-- works
DROP TRIGGER IF EXISTS tour_change_is_active;
DELIMITER $$
CREATE TRIGGER tour_change_is_active
	AFTER DELETE ON place
	FOR EACH ROW BEGIN
		UPDATE tour set is_active = 0 WHERE tour.place_of_departure_id = OLD.place_id AND tour.place_of_destination_id = OLD.place_id;
	END $$ 
DELIMITER ;
-- delete from place where place_id = 255;

-- works
DROP TRIGGER IF EXISTS delete_guide_ratings;
DELIMITER $$
CREATE TRIGGER delete_guide_ratings
	BEFORE DELETE ON guide
	FOR EACH ROW BEGIN
		DELETE FROM guide_rating WHERE guide_rating.schedule_id IN (SELECT schedule.schedule_id FROM schedule WHERE schedule.guide_id = OLD.guide_id);
	END $$ 
DELIMITER ;
delete from guide where guide_id = 130;
-- delete from gudie rating where guide is 130

-- works
DROP TRIGGER IF EXISTS delete_tour_ratings;
DELIMITER $$
CREATE TRIGGER delete_tour_ratings
	BEFORE DELETE ON tour
	FOR EACH ROW BEGIN
		DELETE FROM tour_rating WHERE tour_rating.schedule_id IN (SELECT schedule.schedule_id FROM schedule WHERE schedule.tour_id = OLD.tour_id);
	END $$ 
DELIMITER ;
    
CREATE OR REPLACE VIEW tour_rating_view AS
	SELECT place.place_name AS destination, tour.price, tour.description, tour.rating AS "full rating", 
			schedule.schedule_date_time,
            tour_rating.rating, tour_rating.comment
    FROM tour 
		JOIN place ON tour.place_of_departure_id = place.place_id
        JOIN schedule ON tour.tour_id = schedule.tour_id
        JOIN tour_rating ON schedule.schedule_id = tour_rating.schedule_id
	ORDER BY tour.tour_id;
 
SELECT * FROM tour_rating_view; 
        
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
        
SELECT * FROM guide_rating_view; 
    
    
    
    
-- SELECT * FROM invoices_with_balance;

-- EXPLAIN SELECT*FROMcustomersWHEREstate='WV';
-- price, date, rating, password
SELECT * FROM booking;
SELECT * FROM tour WHERE rating > 2;
EXPLAIN SELECT * FROM tour ORDER BY rating LIMIT 10; -- 500, 33.33,  500 100
CREATE INDEX idx_rating ON tour (rating); -- 500, 32.40, 22, 100,   10, 100
DROP INDEX idx_rating ON tour;
 SELECT * FROM schedule WHERE schedule.schedule_date_time > "2017-11-9 9:12:24";
EXPLAIN SELECT * FROM schedule WHERE schedule.schedule_date_time > "2017-11-9 9:12:24"; -- 500,33.33
CREATE INDEX idx_date ON schedule (schedule_date_time); -- 500, 41.00
EXPLAIN SELECT * FROM schedule WHERE schedule.schedule_date_time > "2017-11-9 9:12:24" ORDER BY schedule.schedule_date_time DESC;
DROP INDEX idx_date ON schedule;
EXPLAIN SELECT * FROM tour WHERE price < 50; -- 500 33.33
CREATE INDEX idx_price ON tour (price); -- 13, 100

EXPLAIN UPDATE tour SET rating = 5 WHERE tour_id = 5; -- 1 100

EXPLAIN SELECT * FROM schedule JOIN tour ON schedule.tour_id = tour.tour_id ORDER BY rating;
CREATE INDEX idx_rating ON tour (rating);
EXPLAIN SELECT * FROM schedule JOIN tour ON schedule.tour_id = tour.tour_id JOIN place ON place.place_id = tour.place_of_destination_id ORDER BY place_id;
EXPLAIN SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id;