const router = require('express').Router();
const { pool } = require('../database/connection');
const { Tour } = require('../models/Tour');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mysql/tours', (req, res) => {
    const sortColumn = req.query.sortColumn || 'tour_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        pool.getConnection((err, db) => {
            let query = `CALL PaginateSort(?, ?, ?, ?, ?)`;
            db.query(query, ['tour', sortColumn, direction, size, page], (error, result, fields) => {
                if (result && result.length && result[0].length) {
                    const tours = [];
                    for (const tour of result[0]) {
                        //create new object
                        tours.push(new Tour(tour.tour_id, tour.price, tour.duration, tour.number_of_spots, tour.difficulty, tour.age_limit, tour.place_of_departure_id, tour.distance, tour.description, tour.rating, tour.place_of_destination_id, tour.is_active));
                    }
                    res.send(tours);
                } else if (error) {
                    res.send({
                        message: error.sqlMessage,
                    });
                } else {
                    res.send({
                        message: 'No results',
                    });
                }
            });
            db.release();
        });
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});

router.get('/api/mysql/tours/:tour_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tour WHERE tour_id = ?';
        db.query(query, [req.params.tour_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Tour(result[0].tour_id, result[0].price, result[0].duration, result[0].number_of_spots, result[0].difficulty, result[0].age_limit, result[0].place_of_departure_id, result[0].distance, result[0].description, result[0].rating, result[0].place_of_destination_id, result[0].is_active));
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/tours/description/:search_keys', (req, res) => {
    pool.getConnection((err, db) => {
        let query = `select * from tour where match (description) against (?);`;
        db.query(query, [req.params.search_keys], (error, result, fields) => {
            if (result && result.length) {
                const tours = [];
                for (const tour of result) {
                    //create new object
                    tours.push(new Tour(tour.tour_id, tour.price, tour.duration, tour.number_of_spots, tour.difficulty, tour.age_limit, tour.place_of_departure_id, tour.distance, tour.description, tour.rating, tour.place_of_destination_id, tour.is_active));
                }
                res.send(tours);
            } else if (error) {
                res.send({
                    message: error.sqlMessage,
                });
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
        let query = 'DELETE FROM tourguide.tour WHERE tour_id = ?;';
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
        let query = 'UPDATE tour SET difficulty = ?, price = ?, duration = ?, number_of_spots = ?, age_limit = ?, distance = ?, description = ?, place_of_departure_id = ?, place_of_destination_id = ?, is_active = ? WHERE tour_id = ?;';
        db.query(query, [req.body.difficulty, req.body.price, req.body.duration, req.body.numberOfSpots, req.body.ageLimit, req.body.distance, req.body.description, req.body.placeOfDeparture, req.body.placeOfDestination, req.body.isActive, req.params.tour_id], (error, result, fields) => {
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

//update one field
router.patch('/api/mysql/tours/:tour_id', (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    //we can restrict fields to update here
    if (!fieldName || fieldName === 'tour_id' || !fieldValue ) {
        res.send({
            message: 'Nothing to update',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `UPDATE tour SET ${fieldName} = ? WHERE tour_id = ?;`;
        db.query(query, [fieldValue, req.params.tour_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: `Tour ${fieldName} successfully updated.`,
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