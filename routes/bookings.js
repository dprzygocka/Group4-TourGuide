const router = require('express').Router();
const { pool } = require('../database/connection');
const { Booking } = require('../models/Booking');

router.get('/api/mysql/bookings', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM booking';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const bookings = [];
                for (const booking of result) {
                    //create new object
                    bookings.push(new Booking(booking.number_of_spots, booking.total_price, booking.date_time, booking.customer_id, booking.schedule_id));
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

router.get('/api/mysql/bookings/:booking_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = `SELECT * FROM booking WHERE booking_id = ?`;
        db.query(query, [req.params.booking_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Booking(result[0].number_of_spots, result[0].total_price, result[0].date_time, result[0].customer_id, result[0].schedule_id));
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
    pool.getConnection((err, db) => {
        let query = 'INSERT INTO booking VALUES (?, ?, ?, ?, ?)';
        db.query(query, [req.body.numberOfSpots, req.body.totalPrice, req.body.dateTime, req.body.customerId, req.body.scheduleId], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Booking successfully added.',
                });
            } else {
                res.send({
                    message: 'Something went wrong',
                });
            }
        });
        db.release();
    });
});


module.exports = {
    router,
  };