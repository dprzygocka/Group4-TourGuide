-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema tourguide
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema tourguide
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS tourguide;
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
  `password` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE INDEX `customer_id_UNIQUE` (`customer_id` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tourguide`.`place`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`place` (
  `place_id` INT NOT NULL AUTO_INCREMENT,
  `place_name` NVARCHAR(120) NOT NULL,
  PRIMARY KEY (`place_id`),
  UNIQUE INDEX `place_id_UNIQUE` (`place_id` ASC),
  UNIQUE INDEX `place_name_UNIQUE` (`place_name` ASC))
ENGINE = InnoDB;


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
  `rating` DECIMAL(3,2) NULL,
  `description` NVARCHAR(510) NOT NULL,
  `place_of_departure_id` INT NULL,
  `place_of_destination_id` INT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`tour_id`),
  UNIQUE INDEX `tour_id_UNIQUE` (`tour_id` ASC),
  INDEX `tour_place_idx` (`place_of_destination_id` ASC),
  INDEX `departure_place_idx` (`place_of_departure_id` ASC),
  CONSTRAINT `tour_place`
    FOREIGN KEY (`place_of_destination_id`)
    REFERENCES `tourguide`.`place` (`place_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `departure_place`
    FOREIGN KEY (`place_of_departure_id`)
    REFERENCES `tourguide`.`place` (`place_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


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
  `rating` DECIMAL(3,2) NULL,
  `contract_end_date` DATE NOT NULL,
  PRIMARY KEY (`guide_id`),
  UNIQUE INDEX `guide_id_UNIQUE` (`guide_id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tourguide`.`schedule`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`schedule` (
  `schedule_id` INT NOT NULL AUTO_INCREMENT,
  `number_of_free_spots` INT NULL,
  `schedule_date_time` DATETIME NOT NULL,
  `tour_id` INT NOT NULL DEFAULT -1,
  `guide_id` INT NULL,
  PRIMARY KEY (`schedule_id`),
  INDEX `tour_schedule_idx` (`tour_id` ASC),
  UNIQUE INDEX `schedule_id_UNIQUE` (`schedule_id` ASC),
  INDEX `guide_schedule_idx` (`guide_id` ASC),
  CONSTRAINT `tour_schedule`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tourguide`.`tour` (`tour_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `guide_schedule`
    FOREIGN KEY (`guide_id`)
    REFERENCES `tourguide`.`guide` (`guide_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tourguide`.`booking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`booking` (
  `number_of_spots` INT NOT NULL,
  `total_price` DECIMAL(8,2) NULL,
  `booking_date_time` DATETIME NOT NULL,
  `customer_id` INT NOT NULL,
  `schedule_id` INT NOT NULL,
  INDEX `customer_booking_idx` (`customer_id` ASC),
  INDEX `schedule_booking_idx` (`schedule_id` ASC), -- ask about composite, this doesnt seem necessary but the one above does?
  PRIMARY KEY (`schedule_id`, `customer_id`),
  UNIQUE (`schedule_id`, `customer_id`), -- ask cause same as primary key
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
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tourguide`.`guide_rating`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`guide_rating` (
  `guide_rating_id` INT NOT NULL AUTO_INCREMENT,
  `schedule_id` INT NOT NULL,
  `customer_id` INT NULL,
  `rating` DECIMAL(2,1) NOT NULL,
  `comment` NVARCHAR(510) NULL,
  PRIMARY KEY (`guide_rating_id`),
  UNIQUE INDEX `guide_rating_id_UNIQUE` (`guide_rating_id` ASC),
  INDEX `customer_rate_guide_idx` (`customer_id` ASC),
  INDEX `rated_guide_idx` (`schedule_id` ASC),
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
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tourguide`.`tour_rating`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tourguide`.`tour_rating` (
  `tour_rating_id` INT NOT NULL AUTO_INCREMENT,
  `schedule_id` INT NOT NULL,
  `customer_id` INT NULL,
  `rating` DECIMAL(2,1) NOT NULL,
  `comment` NVARCHAR(510) NULL,
  PRIMARY KEY (`tour_rating_id`),
  INDEX `customer_rate_tour_idx` (`customer_id` ASC),
  UNIQUE INDEX `tour_rating_id_UNIQUE` (`tour_rating_id` ASC),
  INDEX `rated_tour_idx` (`schedule_id` ASC),
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
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
