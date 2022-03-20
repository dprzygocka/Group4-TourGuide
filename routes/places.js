const router = require('express').Router();
const { pool } = require('../database/connection');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mysql/places', (req, res) => {
    const sortColumn = req.query.sortColumn || 'place_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        pool.getConnection((err, db) => {
            let query = `CALL PaginateSort(?, ?, ?, ?, ?)`;
            db.query(query, ['place', sortColumn, direction, size, page], (error, result, fields) => {
                if (result && result.length && result[0].length) {
                    const places = [];
                    for (const place of result[0]) {
                        //create new object
                        places.push(place.place_name);
                    }
                    res.send(places);
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

router.patch('/api/mysql/places/:place_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'UPDATE place SET place_name = ? WHERE place_id = ?';
        db.query(query, [req.body.placeName, req.params.place_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Place successfully updated.',
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
