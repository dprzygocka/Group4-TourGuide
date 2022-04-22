const router = require('express').Router();
const { pool } = require('../database/connection');

router.get('/api/mysql/view/guide_rating_view', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tourguide.guide_rating_view;';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                res.send(result);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/view/tour_place_schedule', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tourguide.tour_place_schedule;';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                res.send(result);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/view/tour_rating_view', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tourguide.tour_rating_view;';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                res.send(result);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});

module.exports = {
    router,
  };