const router = require('express').Router();
const { pool } = require('../database/connection');

router.get('/api/mysql/places', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM place';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const places = [];
                for (const place of result) {
                    //create new object
                    places.push(place.place_name);
                }
                res.send(places);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/places/:place_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM place WHERE place_id = ?';
        db.query(query, [req.params.place_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(result[0].place_name);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.post('/api/mysql/places', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'INSERT INTO place (place_name) VALUES (?)';
        db.query(query, [req.body.placeName], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Place successfully added.',
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

router.delete('/api/mysql/places/:place_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'DELETE FROM place WHERE place_id = ?';
        db.query(query, [req.params.place_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Place successfully deleted.',
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
