const router = require('express').Router();
const Customer = require('../mongoModels/Customer.js');
const bcrypt = require("bcrypt");
const {database} = require('../database/connection_mongo');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const Schedule = require('../mongoModels/Schedule.js');
const mongoose = require('mongoose');

const saltRounds = 15;

router.get('/api/mongodb/customers', async (req, res) => {
    const sortColumn = req.query.sortColumn || '_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    const sortData = {};
    sortData[sortColumn] = direction;
        if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        try {
            const customers = await Customer.find().skip(page).limit(size).sort(sortData).exec();
            res.send(customers);
        } catch (error) {
            res.send(error);
        }
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});

router.get('/api/mongodb/customers/:customer_id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customer_id);
        res.send(customer);
    } catch (error) {
        res.send(error);
    }
});

router.post('/api/mongodb/customers/register', async (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, async (error, hash) => {
        if (!error) {
            try {
                const customer = await Customer.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email,
                    password: hash,
                })
                res.send(customer);
            } catch (error) {
                res.send(error);
            }
        } else {
            res.status(500).send({
                message: "Something went wrong. Try again."
            });
        }
    });
});

router.post('/api/mongodb/customers/login', async (req, res) => {
    try {
        const customer = await Customer.findOne({
                email: req.body.email
        }).exec();
        bcrypt.compare(req.body.password, customer.password, (error, match) => {
            if (match) {
                res.send({
                    message: 'Customer logged in.',
                });
            } else {
                res.status(401).send({
                    message: "Incorrect username or password. Try again."
                });
            }
        });
    } catch (error) {
        res.send(error);
    }
});

router.patch('/api/mongodb/customers/unregister', async (req, res) => {
    try {
        const customer = await Customer.findOne({
                email: req.body.email
        }).exec();
        //if retrieved password matches provided one, set password to null
        if (customer && customer.password) {
            bcrypt.compare(req.body.password, customer.password, async (error, match) => {
                if (match) {
                    const count = await Customer.findByIdAndUpdate(
                        customer._id
                    , {
                        $unset: {password: ""}
                    })
                    if (count[0] !== 0) {
                        res.send("Customer unregistered");
                    } else {
                        res.send("Customer with provided email and password not found");
                    }
                    return;
                } else {
                    res.send("Customer already unregistered");
                }
            })
        }
	} catch (error) {
		    res.send(error);
	}
});

router.patch('/api/mongodb/bookings/:customer_id', async (req, res) => {
    const session = await database.startSession();
    session.startTransaction();
    try {
        const schedule = await Schedule.findById(
            req.body.scheduleId,
            'schedule_datetime tour.number_of_spots tour.price'
        ).exec();
        if (schedule && schedule.schedule_datetime <= new Date(req.body.dateTime)) {
            throw new Error('You cannot book schedules from the past.');
        } else if (!schedule) {
            throw new Error('Selected schedule doesn\'t exist.');
        }
        if (schedule.tour.number_of_spots < req.body.numberOfSpots) {
            throw new Error('Not enough free spots.');
        }
        await Schedule.findByIdAndUpdate(schedule._id, {
            $set: {'tour.number_of_spots': schedule.tour.number_of_spots - req.body.numberOfSpots}
        })
        const customer = await Customer.findByIdAndUpdate(req.params.customer_id, {
            $push: {
                bookings: {
                    _id: mongoose.Types.ObjectId(),
                    number_of_spots: req.body.numberOfSpots,
                    total_price: Number(schedule.tour.price * req.body.numberOfSpots),
                    booking_date_time: req.body.dateTime,
                    schedule_id: schedule._id
                }
            }
        }).exec();
        await session.commitTransaction();
        await session.endSession();
        res.send(customer.bookings);
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
		res.send(error.message);
	}
});

module.exports = {
  router,
};