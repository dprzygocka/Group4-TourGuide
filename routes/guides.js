const router = require('express').Router();
const { pool } = require('../database/connection');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const { Guide } = require('../models/Guide');

router.get('/api/mysql/guides', (req, res) => {
    const sortColumn = req.query.sortColumn || 'guide_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        pool.getConnection((err, db) => {
            let query = `CALL PaginateSort('guide', ?, ?, ?, ?);`;
            db.query(query, [sortColumn, direction, size, page], (error, result, fields) => {
                if (result && result.length && result[0].length) {
                    const guides = [];
                    for (const guide of result[0]) {
                        //create new object
                        guides.push(new Guide(guide.guide_id, guide.first_name, guide.last_name, guide.email, guide.phone, guide.license, guide.rating));
                    }
                    res.send(guides);
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

router.get('/api/mysql/guides/:guide_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM guide WHERE guide_id = ?';
        db.query(query, [req.params.guide_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Guide(result[0].guide_id, result[0].first_name, result[0].last_name, result[0].email, result[0].phone, result[0].license, result[0].rating));
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.post('/api/mysql/guides', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'INSERT INTO guide (first_name, last_name, license, phone, email) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [req.body.firstName, req.body.lastName, req.body.license, req.body.phone, req.body.email], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Guide successfully added.',
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

router.delete('/api/mysql/guides/:guide_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'DELETE FROM guide WHERE guide_id = ?';
        db.query(query, [req.params.guide_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Guide successfully deleted.',
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
