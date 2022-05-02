const router = require('express').Router();
const { pool } = require('../database/connection');
const { Booking } = require('../models/Booking');
const { Schedule } = require('../models/Schedule');
const { Customer } = require('../models/Customer');

router.get('/api/mysql/bookings', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT booking.*, customer.first_name, customer.last_name FROM booking join customer on booking.customer_id = customer.customer_id';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const bookings = [];
                for (const booking of result) {
                    //create new object
                    bookings.push(new Booking(booking.number_of_spots, booking.total_price, booking.booking_date_time, new Customer(booking.customer_id, booking.first_name, booking.last_name), new Schedule(booking.schedule_id)));
                }
                res.send(bookings);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/bookings/:schedule_id/:customer_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT booking.*, customer.first_name, customer.last_name FROM booking join customer on booking.customer_id = customer.customer_id WHERE booking.schedule_id = ? AND booking.customer_id = ?;';
        db.query(query, [req.params.schedule_id, req.params.customer_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Booking(result[0].number_of_spots, result[0].total_price, result[0].booking_date_time, new Customer(result[0].customer_id, result[0].first_name, result[0].last_name), new Schedule(result[0].schedule_id)));
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.post('/api/mysql/bookings', (req, res) => {
    //console.log('got request');
    pool.getConnection(async (err, db) => {
        /*await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        Need to check which level to set*/
        //console.log('before transaction start');
        await db.promise().beginTransaction();
        //console.log('after transaction start');
        try {
            let query = 'SELECT schedule_date_time FROM schedule WHERE schedule.schedule_id = ?';
            await db.promise().query(query, [req.body.scheduleId])
                .then(([result, fields]) => {
                    if (result && result[0].schedule_date_time <= req.body.dateTime) {
                        throw new Error('You cannot book schedules from the past.');
                    }
                })
            query = 'SELECT number_of_free_spots FROM schedule WHERE schedule.schedule_id = ?';
            let number_of_free_spots;
            let total_price;
            //console.log('before get number of free spots');
            await db.promise().query(query, [req.body.scheduleId])
                .then(([result, fields]) => {
                    if (result && result[0].number_of_free_spots >= req.body.numberOfSpots) {
                        number_of_free_spots = result[0].number_of_free_spots;
                    } else {
                        throw new Error('Not enough free spots.');
                    }
                })
            //console.log(`number of free spots ${number_of_free_spots}, ${req.body.numberOfSpots}`);
            query = 'UPDATE schedule SET number_of_free_spots = ? WHERE schedule_id = ?;'
            await db.promise().query(query, [number_of_free_spots - req.body.numberOfSpots, req.body.scheduleId])
                .then(([result, fields]) => {
                    if (!result || result.affectedRows !== 1) {
                        throw new Error('Something went wrong with updating free spots.');
                    }
                });
            //console.log(`schedule updated`);
            query = 'SELECT t.price FROM schedule JOIN tour AS t ON schedule.tour_id = t.tour_id WHERE schedule.schedule_id = ? LIMIT 1';
            await db.promise().query(query, [req.body.scheduleId])
                .then(([result, fields]) => {
                    if (result && result[0]) {
                        //console.log(result[0].price );
                        total_price = result[0].price * req.body.numberOfSpots;
                    } else {
                        throw new Error('Cannot retrieve tour price.');
                    }
                })
            //console.log(`total price ${total_price}`);
            query = 'INSERT INTO booking VALUES (?, ?, ?, ?, ?)';
            await db.promise().query(query, [req.body.numberOfSpots, total_price, req.body.dateTime, req.body.customerId, req.body.scheduleId])
                .then(([result, fields]) => {
                    if (!result || result.affectedRows !== 1) {
                        throw new Error('Cannot create booking.');
                    }
                })
            //console.log(`booking inserted`);
            await db.promise().commit();
            //console.log(`commited`);
            res.send({
                message: 'Booking successfully added.',
            });
        } catch(err) {
            //console.log(`failed ${err}`);
            await db.promise().rollback();
            //console.log(`rolled back`);
            res.send({
                message: `Error occured while creating booking. Please try again later.\n${err}`,
            });
        }
        db.release();
    });
});


module.exports = {
    router,
  };