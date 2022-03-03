const router = require('express').Router();
const { pool } = require('../database/connection');
const { Rating } = require('../models/Rating');

router.get('/api/mysql/ratings', (req, res) => {
    const ratingType = req.query.ratingType; //path variable
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `SELECT * FROM ${ratingType}`;
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const ratings = [];
                for (const rating of result) {
                    //create new object
                    ratings.push(new Rating(rating[`${ratingType}_id`], rating.schedule_id, rating.customer_id, rating.rating, rating.comment));
                }
                res.send(ratings);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
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

router.put('/api/mysql/ratings/:rating_id', (req, res) => {
    const ratingType = req.query.ratingType;
    if (!ratingType && (ratingType !== 'guide_rating' || ratingType !== 'tour_rating')) {
        res.send({
            message: 'No results',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `UPDATE ${ratingType} SET schedule_id = ?, customer_id = ?, rating = ?, comment = ? WHERE ${ratingType}_id = ?`;
        db.query(query, [req.body.scheduleId, req.body.customerId, req.body.rating, req.body.comment, req.params.rating_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Rating successfully updated.',
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

    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    //we can restrict fields to update here
    if (!fieldName || fieldName.includes("rating_id") || !fieldValue ) {
        res.send({
            message: 'Nothing to update',
        });
        return;
    }
    pool.getConnection((err, db) => {
        let query = `UPDATE ${ratingType} SET ${fieldName} = ? WHERE ${ratingType}_id = ?`;
        db.query(query, [fieldValue, req.params.rating_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: `Rating ${fieldName} successfully updated.`,
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