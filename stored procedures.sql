/*DROP PROCEDURE IF EXISTS CalculateRating;
DELIMITER $$ 
CREATE PROCEDURE CalculateRating(type_id INT, rating_type VARCHAR(5))
-- OUT average DECIMAL(3,2)
BEGIN
	-- DECLARE average DECIMAL(3,2);
    -- SET @sql = CONCAT('SELECT ', rating_type,'_id, ROUND(AVG(rating),2) FROM ', rating_type,'_rating JOIN schedule ON schedule.schedule_id = ',rating_type,'_rating.schedule_id WHERE ',rating_type,'_rating_id = ',type_id);
	-- PREPARE stmt1 FROM @sql;
    -- EXECUTE stmt1;
	CASE rating_type
		WHEN 'guide' THEN 
			SELECT guide_id, ROUND(AVG(rating),2) AS average FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = type_id;
			UPDATE guide SET guide.rating = @average WHERE guide_id = @id;
        WHEN 'tour' THEN 
			SELECT tour_id, ROUND(AVG(rating),2) AS average FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id WHERE tour_rating_id = type_id;
			UPDATE tour SET tour.rating = @average WHERE tour_id = @id;
    END CASE;
END $$
DELIMITER ;

SELECT schedule.guide_id, ROUND(AVG(rating),2) AS average  FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = 2;

CALL CalculateRating(130, 'guide', @id, @average);

DROP TRIGGER IF EXISTS update_guide_rating;
DELIMITER $$
CREATE TRIGGER update_guide_rating
	AFTER INSERT ON guide_rating
	FOR EACH ROW BEGIN
		-- DECLARE average DECIMAL(3,2);
        -- DECLARE id DECIMAL(3,2);
        CALL CalculateRating(NEW.guide_rating_id, 'guide');
	END $$
DELIMITER ;

INSERT INTO guide_rating (schedule_id, customer_id, rating, comment) VALUES 
(284, 492, 1.5, "amet, dapibus id, blandit at, nisi. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin vel nisl. Quisque fringilla euismod enim. Etiam gravida molestie arcu. Sed");
SELECT guide_id FROM schedule WHERE schedule_id = 284;
SELECT * FROM guide WHERE guide_id = 130;

-- works booking total_price based on amount of people
DROP TRIGGER IF EXISTS update_total_price;
DELIMITER $$
CREATE TRIGGER update_total_price
	BEFORE INSERT ON booking
	FOR EACH ROW BEGIN
		SET NEW.total_price = ((SELECT t.price FROM booking JOIN schedule ON schedule.schedule_id = NEW.schedule_id JOIN tour AS t ON schedule.tour_id = t.tour_id WHERE schedule.schedule_id = NEW.schedule_id AND customer_id = NEW.customer_id LIMIT 1) * NEW.number_of_spots);
	END $$ 
DELIMITER ;

SELECT t.price FROM booking JOIN schedule ON schedule.schedule_id = 5 JOIN tour AS t ON schedule.tour_id = t.tour_id LIMIT 1;*/
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
DROP EVENT IF EXISTS delete_old_bookings;
DELIMITER $$
CREATE EVENT delete_old_bookings ON SCHEDULE EVERY 1 YEAR
STARTS '2022-01-01' ENDS '2035-01-01'
DO BEGIN 
	DELETE FROM booking WHERE booking_date_time < NOW() - INTERVAL 5 YEAR;
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
    
    
SELECT * FROM invoices_with_balance;