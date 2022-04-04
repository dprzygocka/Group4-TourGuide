-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema tourguide
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema tourguide
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `tourguide` DEFAULT CHARACTER SET utf8 ;
USE `tourguide` ;

-- -----------------------------------------------------
-- Table `tourguide`.`customer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`customer` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(60) NOT NULL,
  `last_name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(127) NOT NULL,
  `password` VARCHAR(100) NULL DEFAULT NULL,
  `phone` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE INDEX `customer_id_UNIQUE` (`customer_id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `idx_password` (`password` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`guide`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`guide` (
  `guide_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(60) NOT NULL,
  `last_name` VARCHAR(60) NOT NULL,
  `license` VARCHAR(45) NOT NULL,
  `email` VARCHAR(127) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `rating` DECIMAL(3,2) NULL DEFAULT NULL,
  `contract_end_date` DATE NOT NULL,
  PRIMARY KEY (`guide_id`),
  UNIQUE INDEX `guide_id_UNIQUE` (`guide_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`place`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`place` (
  `place_id` INT NOT NULL AUTO_INCREMENT,
  `place_name` VARCHAR(120) CHARACTER SET 'utf8' NOT NULL,
  PRIMARY KEY (`place_id`),
  UNIQUE INDEX `place_id_UNIQUE` (`place_id` ASC) VISIBLE,
  UNIQUE INDEX `place_name_UNIQUE` (`place_name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`tour`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`tour` (
  `tour_id` INT NOT NULL AUTO_INCREMENT,
  `difficulty` ENUM('EASY', 'MEDIUM', 'HARD', 'EXTREME') NOT NULL,
  `price` DECIMAL(6,2) NOT NULL,
  `duration` DECIMAL(3,1) NOT NULL,
  `number_of_spots` INT NOT NULL,
  `age_limit` INT NOT NULL,
  `distance` DECIMAL(4,1) NOT NULL,
  `rating` DECIMAL(3,2) NULL DEFAULT NULL,
  `description` VARCHAR(510) CHARACTER SET 'utf8' NOT NULL,
  `place_of_departure_id` INT NULL DEFAULT NULL,
  `place_of_destination_id` INT NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`tour_id`),
  UNIQUE INDEX `tour_id_UNIQUE` (`tour_id` ASC) VISIBLE,
  INDEX `tour_place_idx` (`place_of_destination_id` ASC) VISIBLE,
  INDEX `departure_place_idx` (`place_of_departure_id` ASC) VISIBLE,
  INDEX `idx_price` (`price` ASC) VISIBLE,
  INDEX `idx_tour_rating_price` (`price` ASC, `rating` ASC) VISIBLE,
  FULLTEXT INDEX `idx_tour_description` (`description`) VISIBLE,
  CONSTRAINT `departure_place`
    FOREIGN KEY (`place_of_departure_id`)
    REFERENCES `tourguide`.`place` (`place_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `tour_place`
    FOREIGN KEY (`place_of_destination_id`)
    REFERENCES `tourguide`.`place` (`place_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`schedule`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`schedule` (
  `schedule_id` INT NOT NULL AUTO_INCREMENT,
  `number_of_free_spots` INT NULL DEFAULT NULL,
  `schedule_date_time` DATETIME NOT NULL,
  `tour_id` INT NOT NULL DEFAULT '-1',
  `guide_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  UNIQUE INDEX `schedule_id_UNIQUE` (`schedule_id` ASC) VISIBLE,
  INDEX `tour_schedule_idx` (`tour_id` ASC) VISIBLE,
  INDEX `guide_schedule_idx` (`guide_id` ASC) VISIBLE,
  INDEX `idx_date` (`schedule_date_time` ASC) VISIBLE,
  CONSTRAINT `guide_schedule`
    FOREIGN KEY (`guide_id`)
    REFERENCES `tourguide`.`guide` (`guide_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `tour_schedule`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tourguide`.`tour` (`tour_id`)
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`booking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`booking` (
  `number_of_spots` INT NOT NULL,
  `total_price` DECIMAL(8,2) NULL DEFAULT NULL,
  `booking_date_time` DATETIME NOT NULL,
  `customer_id` INT NOT NULL,
  `schedule_id` INT NOT NULL,
  PRIMARY KEY (`schedule_id`, `customer_id`),
  UNIQUE INDEX `schedule_id` (`schedule_id` ASC, `customer_id` ASC) VISIBLE,
  INDEX `customer_booking_idx` (`customer_id` ASC) VISIBLE,
  INDEX `schedule_booking_idx` (`schedule_id` ASC) VISIBLE,
  CONSTRAINT `customer_booking`
    FOREIGN KEY (`customer_id`)
    REFERENCES `tourguide`.`customer` (`customer_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `schedule_booking`
    FOREIGN KEY (`schedule_id`)
    REFERENCES `tourguide`.`schedule` (`schedule_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`booking_audit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`booking_audit` (
  `booking_audit_id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `schedule_id` INT NOT NULL,
  `column_name` VARCHAR(255) NULL DEFAULT NULL,
  `new_value` VARCHAR(255) NULL DEFAULT NULL,
  `action_type` VARCHAR(255) NULL DEFAULT NULL,
  `done_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_audit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`guide_rating`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`guide_rating` (
  `guide_rating_id` INT NOT NULL AUTO_INCREMENT,
  `schedule_id` INT NOT NULL,
  `customer_id` INT NULL DEFAULT NULL,
  `rating` DECIMAL(2,1) NOT NULL,
  `comment` VARCHAR(510) CHARACTER SET 'utf8' NULL DEFAULT NULL,
  PRIMARY KEY (`guide_rating_id`),
  UNIQUE INDEX `guide_rating_id_UNIQUE` (`guide_rating_id` ASC) VISIBLE,
  INDEX `customer_rate_guide_idx` (`customer_id` ASC) VISIBLE,
  INDEX `rated_guide_idx` (`schedule_id` ASC) VISIBLE,
  CONSTRAINT `customer_rate_guide`
    FOREIGN KEY (`customer_id`)
    REFERENCES `tourguide`.`customer` (`customer_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `rated_guide`
    FOREIGN KEY (`schedule_id`)
    REFERENCES `tourguide`.`schedule` (`schedule_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`tour_audit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`tour_audit` (
  `tour_audit_id` INT NOT NULL AUTO_INCREMENT,
  `tour_id` INT NOT NULL,
  `column_name` VARCHAR(255) NULL DEFAULT NULL,
  `new_value` VARCHAR(255) NULL DEFAULT NULL,
  `action_type` VARCHAR(255) NULL DEFAULT NULL,
  `done_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tour_audit_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `tourguide`.`tour_rating`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`tour_rating` (
  `tour_rating_id` INT NOT NULL AUTO_INCREMENT,
  `schedule_id` INT NOT NULL,
  `customer_id` INT NULL DEFAULT NULL,
  `rating` DECIMAL(2,1) NOT NULL,
  `comment` VARCHAR(510) CHARACTER SET 'utf8' NULL DEFAULT NULL,
  PRIMARY KEY (`tour_rating_id`),
  UNIQUE INDEX `tour_rating_id_UNIQUE` (`tour_rating_id` ASC) VISIBLE,
  INDEX `customer_rate_tour_idx` (`customer_id` ASC) VISIBLE,
  INDEX `rated_tour_idx` (`schedule_id` ASC) VISIBLE,
  CONSTRAINT `customer_rate_tour`
    FOREIGN KEY (`customer_id`)
    REFERENCES `tourguide`.`customer` (`customer_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `rated_tour`
    FOREIGN KEY (`schedule_id`)
    REFERENCES `tourguide`.`schedule` (`schedule_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;

USE `tourguide` ;

-- -----------------------------------------------------
-- Placeholder table for view `tourguide`.`guide_rating_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`guide_rating_view` (`first_name` INT, `last_name` INT, `full rating` INT, `destination` INT, `description` INT, `schedule_date_time` INT, `rating` INT, `comment` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tourguide`.`tour_place_schedule`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`tour_place_schedule` (`destination` INT, `price` INT, `description` INT, `rating` INT, `number_of_free_spots` INT, `schedule_date_time` INT, `first_name` INT, `last_name` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tourguide`.`tour_rating_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`tour_rating_view` (`destination` INT, `price` INT, `description` INT, `full rating` INT, `schedule_date_time` INT, `rating` INT, `comment` INT);

-- -----------------------------------------------------
-- procedure CalculateRating
-- -----------------------------------------------------

DELIMITER $$
USE `tourguide`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateRating`(type_id INT, rating_type VARCHAR(5), OUT id INT, OUT average DECIMAL(3,2))
BEGIN
	CASE rating_type
		WHEN 'guide' THEN 
			SELECT guide_id INTO id FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id WHERE guide_rating_id = type_id;
		    SELECT ROUND(AVG(guide_rating.rating),2) INTO average FROM guide_rating JOIN schedule ON schedule.schedule_id = guide_rating.schedule_id JOIN guide ON schedule.guide_id = guide.guide_id WHERE guide.guide_id = id;
        WHEN 'tour' THEN 
			SELECT tour_id INTO id FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id WHERE tour_rating_id = type_id;
			SELECT ROUND(AVG(tour_rating.rating),2) INTO average FROM tour_rating JOIN schedule ON schedule.schedule_id = tour_rating.schedule_id JOIN tour ON schedule.tour_id = tour.tour_id WHERE tour.tour_id = id;
    END CASE;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- function DeleteOldCustomers
-- -----------------------------------------------------

DELIMITER $$
USE `tourguide`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `DeleteOldCustomers`() RETURNS int
    READS SQL DATA
BEGIN
	DECLARE quantity INT;
    SET quantity = (SELECT COUNT(customer_id) FROM customer);
    DELETE FROM customer WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM booking) AND password IS NULL;
    SET quantity = quantity - (SELECT COUNT(customer_id) FROM customer);
    RETURN quantity;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure PaginateSort
-- -----------------------------------------------------

DELIMITER $$
USE `tourguide`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `PaginateSort`(tablename CHAR(30), sortcolumn CHAR(20), direction CHAR(4), size INT, page INT)
BEGIN
	SET @sql = CONCAT('SELECT * FROM ', tablename, ' ORDER BY ', sortcolumn,' ', direction, ' LIMIT ', size, ' OFFSET ', page * size);
    PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure ScheduleBetweenDates
-- -----------------------------------------------------

DELIMITER $$
USE `tourguide`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ScheduleBetweenDates`(IN start_date DATE, IN end_date DATE)
BEGIN
	SET @sql = CONCAT('SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id WHERE schedule.schedule_date_time BETWEEN "', start_date, '" AND "', end_date,'"');
    PREPARE stmt1 FROM @sql;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- View `tourguide`.`guide_rating_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tourguide`.`guide_rating_view`;
USE `tourguide`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tourguide`.`guide_rating_view` AS select `tourguide`.`guide`.`first_name` AS `first_name`,`tourguide`.`guide`.`last_name` AS `last_name`,`tourguide`.`guide`.`rating` AS `full rating`,`tourguide`.`place`.`place_name` AS `destination`,`tourguide`.`tour`.`description` AS `description`,`tourguide`.`schedule`.`schedule_date_time` AS `schedule_date_time`,`tourguide`.`guide_rating`.`rating` AS `rating`,`tourguide`.`guide_rating`.`comment` AS `comment` from ((((`tourguide`.`guide` join `tourguide`.`schedule` on((`tourguide`.`guide`.`guide_id` = `tourguide`.`schedule`.`guide_id`))) join `tourguide`.`tour` on((`tourguide`.`tour`.`tour_id` = `tourguide`.`schedule`.`tour_id`))) join `tourguide`.`place` on((`tourguide`.`tour`.`place_of_departure_id` = `tourguide`.`place`.`place_id`))) join `tourguide`.`guide_rating` on((`tourguide`.`schedule`.`schedule_id` = `tourguide`.`guide_rating`.`schedule_id`)));

-- -----------------------------------------------------
-- View `tourguide`.`tour_place_schedule`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tourguide`.`tour_place_schedule`;
USE `tourguide`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tourguide`.`tour_place_schedule` AS select `tourguide`.`place`.`place_name` AS `destination`,`tourguide`.`tour`.`price` AS `price`,`tourguide`.`tour`.`description` AS `description`,`tourguide`.`tour`.`rating` AS `rating`,`tourguide`.`schedule`.`number_of_free_spots` AS `number_of_free_spots`,`tourguide`.`schedule`.`schedule_date_time` AS `schedule_date_time`,`tourguide`.`guide`.`first_name` AS `first_name`,`tourguide`.`guide`.`last_name` AS `last_name` from (((`tourguide`.`tour` join `tourguide`.`place` on((`tourguide`.`tour`.`place_of_departure_id` = `tourguide`.`place`.`place_id`))) join `tourguide`.`schedule` on((`tourguide`.`tour`.`tour_id` = `tourguide`.`schedule`.`tour_id`))) join `tourguide`.`guide` on((`tourguide`.`schedule`.`guide_id` = `tourguide`.`guide`.`guide_id`)));

-- -----------------------------------------------------
-- View `tourguide`.`tour_rating_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tourguide`.`tour_rating_view`;
USE `tourguide`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tourguide`.`tour_rating_view` AS select `tourguide`.`place`.`place_name` AS `destination`,`tourguide`.`tour`.`price` AS `price`,`tourguide`.`tour`.`description` AS `description`,`tourguide`.`tour`.`rating` AS `full rating`,`tourguide`.`schedule`.`schedule_date_time` AS `schedule_date_time`,`tourguide`.`tour_rating`.`rating` AS `rating`,`tourguide`.`tour_rating`.`comment` AS `comment` from (((`tourguide`.`tour` join `tourguide`.`place` on((`tourguide`.`tour`.`place_of_departure_id` = `tourguide`.`place`.`place_id`))) join `tourguide`.`schedule` on((`tourguide`.`tour`.`tour_id` = `tourguide`.`schedule`.`tour_id`))) join `tourguide`.`tour_rating` on((`tourguide`.`schedule`.`schedule_id` = `tourguide`.`tour_rating`.`schedule_id`))) order by `tourguide`.`tour`.`tour_id`;
USE `tourguide`;

DELIMITER $$
USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`delete_guide_ratings`
BEFORE DELETE ON `tourguide`.`guide`
FOR EACH ROW
BEGIN
		DELETE FROM guide_rating WHERE guide_rating.schedule_id IN (SELECT schedule.schedule_id FROM schedule WHERE schedule.guide_id = OLD.guide_id);
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`tour_change_is_active`
AFTER DELETE ON `tourguide`.`place`
FOR EACH ROW
BEGIN
		UPDATE tour set is_active = 0 
        WHERE tour.place_of_departure_id = OLD.place_id OR tour.place_of_destination_id = OLD.place_id;
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`audit_trail_tour_delete`
AFTER DELETE ON `tourguide`.`tour`
FOR EACH ROW
BEGIN
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(OLD.tour_id, 'price', OLD.price, 'delete', NOW());
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(OLD.tour_id, 'number_of_spots', OLD.number_of_spots, 'delete', NOW());
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(OLD.tour_id, 'is_active', OLD.is_active, 'delete', NOW());
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`audit_trail_tour_insert`
AFTER INSERT ON `tourguide`.`tour`
FOR EACH ROW
BEGIN
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(NEW.tour_id, 'price', NEW.price, 'insert', NOW());
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(NEW.tour_id, 'number_of_spots', NEW.number_of_spots, 'insert', NOW());
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(NEW.tour_id, 'is_active', NEW.is_active, 'insert', NOW());
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`delete_tour_ratings`
BEFORE DELETE ON `tourguide`.`tour`
FOR EACH ROW
BEGIN
		DELETE FROM tour_rating WHERE tour_rating.schedule_id IN (SELECT schedule.schedule_id FROM schedule WHERE schedule.tour_id = OLD.tour_id);
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`set_schedule_tourid_to_defualt`
BEFORE DELETE ON `tourguide`.`tour`
FOR EACH ROW
BEGIN
		UPDATE schedule SET tour_id = DEFAULT WHERE tour_id = OLD.tour_id;
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`tour_update`
AFTER UPDATE ON `tourguide`.`tour`
FOR EACH ROW
BEGIN
    IF OLD.price <> NEW.price THEN
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(NEW.tour_id, 'price', NEW.price, 'update', NOW());
    END IF;
	IF OLD.number_of_spots <> NEW.number_of_spots THEN
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(NEW.tour_id, 'number_of_spots', NEW.number_of_spots, 'update', NOW());
    END IF;
	IF OLD.is_active <> NEW.is_active THEN
        INSERT INTO tour_audit(tour_id, column_name, new_value, action_type, done_at) values(NEW.tour_id, 'is_active', NEW.is_active, 'update', NOW());
    END IF;
END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`set_number_of_spots`
BEFORE INSERT ON `tourguide`.`schedule`
FOR EACH ROW
BEGIN
		SET NEW.number_of_free_spots = (SELECT number_of_spots FROM tour WHERE tour_id = NEW.tour_id);
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`audit_booking_delete`
AFTER DELETE ON `tourguide`.`booking`
FOR EACH ROW
BEGIN
		INSERT INTO booking_audit (customer_id, schedule_id, column_name, new_value, action_type, done_at) VALUES (OLD.customer_id, OLD.schedule_id, 'total_price', OLD.total_price ,'delete', NOW());
    END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`audit_booking_insert`
AFTER INSERT ON `tourguide`.`booking`
FOR EACH ROW
BEGIN
		INSERT INTO booking_audit (customer_id, schedule_id, column_name, new_value, action_type, done_at) VALUES (NEW.customer_id, NEW.schedule_id, 'total_price', NEW.total_price ,'insert', NOW());
    END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`check_booking_insert`
BEFORE INSERT ON `tourguide`.`booking`
FOR EACH ROW
BEGIN
		DECLARE start_date DATETIME;
        SET start_date = (SELECT schedule_date_time FROM schedule WHERE schedule.schedule_id = NEW.schedule_id);
		IF (start_date <= NEW.booking_date_time) THEN 
			SIGNAL SQLSTATE '45000' 
			SET MESSAGE_TEXT = "ERROR: You cannot book schedules from the past.";
		END IF;
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`update_guide_rating`
AFTER INSERT ON `tourguide`.`guide_rating`
FOR EACH ROW
BEGIN
		DECLARE average DECIMAL(3,2);
        DECLARE id DECIMAL(3,2);
        CALL CalculateRating(NEW.guide_rating_id, 'guide', @id, @average);
		UPDATE guide SET guide.rating = @average WHERE guide_id = @id;
	END$$

USE `tourguide`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `tourguide`.`update_tour_rating`
AFTER INSERT ON `tourguide`.`tour_rating`
FOR EACH ROW
BEGIN
		DECLARE average DECIMAL(3,2);
        DECLARE id DECIMAL(3,2);
        CALL CalculateRating(NEW.tour_rating_id, 'tour', @id, @average);
		UPDATE tour SET tour.rating = @average WHERE tour_id = @id;
	END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
