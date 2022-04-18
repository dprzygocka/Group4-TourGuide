const router = require('express').Router();
const { pool } = require('../database/connection');
const { Rating } = require('../models/Rating');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mysql/ratings', (req, res) => {
    const ratingType = req.query.ratingType; //path variable
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }
    const sortColumn = req.query.sortColumn || `${ratingType}_id`;
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        pool.getConnection((err, db) => {
            let query = `CALL PaginateSort(?, ?, ?, ?, ?)`;
            db.query(query, [ratingType, sortColumn, direction, size, page], (error, result, fields) => {
                if (result && result.length && result[0].length) {
                    const ratings = [];
                    for (const rating of result[0]) {
                        //create new object
                        ratings.push(new Rating(rating[`${ratingType}_id`], rating.schedule_id, rating.customer_id, rating.rating, rating.comment));
                    }
                    res.send(ratings);
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

router.get('/api/mysql/ratings/:rating_id', (req, res) => {
    const ratingType = req.query.ratingType;
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `SELECT * FROM ${ratingType} WHERE ${ratingType}_id = ?`;
        db.query(query, [req.params.rating_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Rating(result[0][`${ratingType}_id`], result[0].schedule_id, result[0].customer_id, result[0].rating, result[0].comment));
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.post('/api/mysql/ratings', (req, res) => {
    const ratingType = req.query.ratingType;
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `INSERT INTO ${ratingType} (schedule_id, customer_id, rating, comment) VALUES (?, ?, ?, ?);`;
        db.query(query, [req.body.scheduleId, req.body.customerId, req.body.rating, req.body.comment], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Rating successfully added.',
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


router.delete('/api/mysql/ratings/:rating_id', (req, res) => {
    const ratingType = req.query.ratingType;
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `DELETE FROM ${ratingType} WHERE ${ratingType}_id = ?;`;
        db.query(query, [req.params.rating_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Rating successfully deleted.',
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
router.patch('/api/mysql/ratings/:rating_id', (req, res) => {
    const ratingType = req.query.ratingType;
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }

    pool.getConnection((err, db) => {
        let query = `UPDATE ${ratingType} SET comment = ? WHERE ${ratingType}_id = ?`;
        db.query(query, [req.body.comment, req.params.rating_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: `Rating comment successfully updated.`,
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