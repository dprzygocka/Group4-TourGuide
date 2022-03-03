# Group4-TourGuide
Top up Software Development, Semester 1, final project for class Databases for Developers.

General Idea
The main concept of this game is to get out of the maze as fast as possible and collect the highest amount of coins. There are different bonuses and traps along the way that will make your traversal easier or harder. Everything is randomly generated, which lowers the probability of having two similar experiences. To make the game more enjoyable, you can play it with your friends and compete against each other.

Features
Variety of characters that players can choose from
Randomly selected map with traps and collectibles
Background music and sound effects
Customizable character dialogues
Multiplayer mode with rooms
Leaderboard
Easy/Hard mode
Run the game
There are two ways of running the game:

online via link: https://maze-game-project.herokuapp.com/. The game is hosted on cloud platform Heroku, accessible at any time to play with you firends all over the world.
locally. The local varsion allows you to run multiplayer game in different browsers but you need to figure out how to connect controls for more than one player. In order to run the game locally:
download the project from github
open terminal and change location to the game folder
run command: node app.js or nodemon app.js (if you encounter problem with npm packages run: npm install to install all packages listed in package.json
go to the browser, type: localhost:8080 and enjoy the game!
Database
The project is connected to ClearDB database hosted on Heroku. So any iteractions with the game will be saved and seen by others. If you wish to create and connect your own database make sure you have MySQL and MySQL Workbench or any other administration tool for local servers. In order to start:

Create the database by running command:
CREATE SCHEMA `<database name>`;
Run the script for table creation,
Run the script with dummy data,
Create .env file and copy content of .env_helper,
Assign your database information to the variables in .env and test the connection.
Table creation script
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
CREATE SCHEMA IF NOT EXISTS `<database name>` DEFAULT CHARACTER SET utf8 ;
USE `<database name>` ;
-- Table <database name>.player

CREATE TABLE IF NOT EXISTS `<database name>`.`player` (
 `player_id` INT NOT NULL AUTO_INCREMENT,
 `username` VARCHAR(45) NOT NULL,
 `password` VARCHAR(200) NOT NULL,
 PRIMARY KEY (`player_id`),
 UNIQUE INDEX `player_id_UNIQUE` (`player_id` ASC) ,
 UNIQUE INDEX `username_UNIQUE` (`username` ASC) )
ENGINE = InnoDB;
-- Table <database name>.high_score

CREATE TABLE IF NOT EXISTS `<database name>`.`high_score` (
 `high_score_id` INT NOT NULL AUTO_INCREMENT,
 `player_id` INT NOT NULL,
 `score` DECIMAL NOT NULL,
 `date_time` DATETIME NOT NULL,
 PRIMARY KEY (`high_score_id`),
 UNIQUE INDEX `high_score_id_UNIQUE` (`high_score_id` ASC) ,
 INDEX `high_score_idx` (`player_id` ASC) ,
 CONSTRAINT `high_score`
   FOREIGN KEY (`player_id`)
   REFERENCES `<database name>`.`player` (`player_id`)
   ON DELETE NO ACTION
   ON UPDATE CASCADE)
ENGINE = InnoDB;
-- Table <database name>.interaction_category

CREATE TABLE IF NOT EXISTS `<database name>`.`interaction_category` (
 `interaction_category_id` INT NOT NULL AUTO_INCREMENT,
 `interaction_category` VARCHAR(45) NOT NULL,
 PRIMARY KEY (`interaction_category_id`),
 UNIQUE INDEX `interaction_category_id_UNIQUE` (`interaction_category_id` ASC) )
ENGINE = InnoDB;
-- Table <database name>.interaction

CREATE TABLE IF NOT EXISTS `<database name>`.`interaction` (
 `interaction_id` INT NOT NULL AUTO_INCREMENT,
 `interaction_message` VARCHAR(45) NOT NULL ,
 `interaction_category_id` INT NOT NULL,
 `player_id` INT DEFAULT NULL,
 PRIMARY KEY (`interaction_id`),
 INDEX `custom_player_interaction_idx` (`player_id` ASC) ,
 CONSTRAINT `interaction_category_id`
   FOREIGN KEY (`interaction_category_id`)
   REFERENCES `<database name>`.`interaction_category` (`interaction_category_id`)
   ON DELETE NO ACTION
   ON UPDATE NO ACTION,
 CONSTRAINT `custom_player_interaction`
   FOREIGN KEY (`player_id`)
   REFERENCES `<database name>`.`player` (`player_id`)
   ON DELETE CASCADE
   ON UPDATE NO ACTION)
ENGINE = InnoDB;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
Dummy data script
INSERT INTO player VALUES (1, 'a_maze_thing', 'difficultPassinteraction_category'), (2, 'destroyer', 'password');
INSERT INTO interaction_category values (1, 'greet'), (2, 'complain'), (3, 'brag'), (4, 'bye');
INSERT INTO interaction VALUES (1, 'Nice to see you!',1,1), (2, 'What a boring game!',2,1),
(3, 'I am the best player in the maze!',3,1), (4, 'Hey there!',1,2), (5, 'This game is too short!',2,2), 
(6, 'Woohooo, I am amazing!',3,2), (7, 'Nice to see you!',1,null), (8, 'What a boring game!',2,null), 
(9, 'I am the best player in the maze!',3,null), (10, 'Hey there!',1,null), (11, 'This game is too short!',2,null), 
(12, 'Woohooo, I am amazing!',3,null), (13, 'Bye bye!',4,null), (14, 'See ya!',4,null), ('Heyaaaa!',1), ('Yo!',1), 
('Stop right there!',1),('Hello!',1),('Hi!',1), ('Guten Tag!',1),('Bonjour!',1),('Ahoj!',1), ('Dzien dobry!',1),
('Dobry den!',1),('Hola!',1),('Goddag!',1), ('Where are other players!',2), ('Who took all the coins?!',2), 
('Who took all the gems?!',2), ('Who keeps teleporting me?!',2),('Stop freezing me!',2), ('How do I move!',2),
('God damnit my keys are reversed!',2), ('Help, I am stuck!',2), ('Look at my score!',3),('I know where the exit is!',3),
('It is too easy for me!',3),('You guys are noobs!',3),('I am so rich!',3), ('Let me freeze you!',3),('I am the fastest one here!',3),
('I am so powerful!',3),('I am the winner!',3) ,('See you losers!',4),('Aufwiedersehen!',4),('Dovidenia!',4),('Hej Hej!',4),
('Dowidzenia!',4),('I am leaving!',4),('See you never again!',4),('Hope to see you again!',4),('I hope we meet again!',4),
('See you on the other side!',4), ('See you on the highscore list!',4);
INSERT INTO high_score VALUES (1, 1, 55, '2021-11-08 12:24:44'), (2,1, 46,'2021-11-09 21:44:14'),
(3, 2, 34, '2021-11-08 11:24:44'), (4,2, 46,'2021-11-08 11:44:14');
About
Final KEA project.

Resources
 Readme
License
 MIT License
Stars
 0 stars
Watchers
 1 watching
Forks
 0 forks
Releases
No releases published
Create a new release
Packages
No packages published
Publish your first package
Contributors 2
@mana998
mana998
@dprzygocka
dprzygocka
Environments 1
 maze-game-project Active
Languages
JavaScript
85.8%
 
CSS
9.8%
 
HTML
4.4%
© 2022 GitHub, Inc.
Terms
Privacy
Security
Status
Docs
Contact GitHub
Pricing
API
Training
Blog
About
