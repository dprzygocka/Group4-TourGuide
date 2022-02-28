const router = require('express').Router;
const { pool } = require('../database/connection');
const { pool } = require('../models/Tour');

router.get('/api/mysql/tours', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tour';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const tours = [];
                for (const tour of result) {
                    //create new object
                    tours.push(new Tour(tour.tour_id, tour.price, tour.duration, tour.numberOfSpots, tour.difficulty, tour.ageLimit, tour.placeOfDeparture, tour.distance, tour.description, tour.rating, tour.placeOfDestination));
                }
                res.send(tours);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/tours/:tour_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tour WHERE tour_id = ?';
        db.query(query, [req.params.tour_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Tour(result[0].tour_id, result[0].price, result[0].duration, result[0].numberOfSpots, result[0].difficulty, result[0].ageLimit, result[0].placeOfDeparture, result[0].distance, result[0].description, result[0].rating, result[0].placeOfDestination));
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.post('/api/mysql/tours', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'INSERT INTO tour (difficulty, price, duration, number_of_spots, age_limit, distance, description, place_of_departure_id, place_of_destination_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [req.body.difficulty, req.body.price, req.body.duration, req.body.numberOfSpots, req.body.ageLimit, req.body.distance, req.body.description, req.body.placeOfDeparture, req.body.placeOfDestination], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Tour successfully added.',
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


router.delete('/api/mysql/tours/:tour_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'DELETE * FROM tour WHERE tour_id = ?';
        db.query(query, [req.params.tour_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Tour successfully deleted.',
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

router.put('/api/mysql/tours/:tour_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'UPDATE tour SET difficulty = ?, price = ?, duration = ?, number_of_spots = ?, age_limit = ?, distance = ?, description = ?, place_of_departure_id = ?, place_of_destination_id = ? WHERE tour_id = ?';
        db.query(query, [req.body.difficulty, req.body.price, req.body.duration, req.body.numberOfSpots, req.body.ageLimit, req.body.distance, req.body.description, req.body.placeOfDeparture, req.body.placeOfDestination, req.params.tour_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Tour successfully updated.',
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