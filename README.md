# Group4-TourGuide
Top up Software Development, Semester 1, final project for class Databases for Developers.

# Project Description and Features
The system's goal is to support companies which offer hiking trips in selling their services online. The product will allow:
- customer login/registration,
- administrator to login into the database,
- booking a hiking trip,
- logged in users to rate and comment on the tour/guide,
- access to detailed information about each trip/guide,
- access to all scheduled trips,
- adding new trips to the system,
- adding new guides to the system,
- adding new departure and destination places,
- creating new schedules,
- accessing historical data regarding bookings, customers, schedules and guides in a span of 5 years

# Tools and Environment  
The project was developed using NodeJS. The relational database chosen for the first part of the assignment is MySQL, managed in Workbench. All the work was done through the integrated development environment Visual Studio Code, provided by Microsoft. Furthermore, Github was used for storing the codebase and git for version control.

# Installation Procedure
In order to run the project locally:
- download the project from Github,
- open terminal and change location to the project folder,
- open tool for database architecture like MySQL Workbench and create local MySQL connection,
- run the create, stored_objects, and insert scripts in MySQL Workbench (scripts are included in the github repository),
- connect to your local database, input your database credentials to the .env file in the project (copy parameters from .env_helper to .env file and fill them out),
- run command: node app.js or nodemon app.js (if you encounter problem with npm packages run: npm install to install all packages listed in package.json),
- send API requests to the following address: localhost:8080 by using i.e. Postman. List of API endpoints can be found in tbd.
