// setup express
const express = require('express');
const app = express();

// setup static dir
app.use(express.static(`${__dirname}`));

// database setup
//const db = require('./database/connection').connection;

// allows to recognise incoming object as json object
app.use(express.json());

// allow to pass form data
app.use(express.urlencoded({ extended: true }));

//mongodb
const mongodb = require('./database/connection_mongo');

//routers
const guidesRouter = require("./routes/guides.js");
const customersRouter = require("./routes/customers.js");
const placesRouter = require("./routes/places.js");
const toursRouter = require("./routes/tours.js");
const schedulesRouter = require("./routes/schedules.js");
const ratingsRouter = require("./routes/ratings.js");
const bookingsRouter = require("./routes/bookings.js");
const mongoTransferRouter = require("./routes/mongoTransfer.js");


app.use(guidesRouter.router);
app.use(customersRouter.router);
app.use(placesRouter.router);
app.use(toursRouter.router);
app.use(schedulesRouter.router);
app.use(ratingsRouter.router);
app.use(bookingsRouter.router);
app.use(mongoTransferRouter.router);

//routers monogo
const placesMongoRouter = require("./mongoRoutes/places.js");
const guidesMongoRouter = require("./mongoRoutes/guides.js");
const customersMongoRouter = require("./mongoRoutes/customers.js");
const toursMongoRouter = require("./mongoRoutes/tours.js");
const schedulesMongoRouter = require("./mongoRoutes/schedules.js");

app.use(placesMongoRouter.router);
app.use(guidesMongoRouter.router);
app.use(customersMongoRouter.router);
app.use(toursMongoRouter.router);
app.use(schedulesMongoRouter.router);

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

const PORT = process.env.PORT || 8080;
/* eslint-disable no-debugger, no-console */
app.listen(PORT, (error) => {
    if (error) {
      console.log(error);
    }
    console.log('Server is running on port', Number(PORT));
});