const router = require('express').Router();
const { pool } = require('../database/connection');
const { Guide } = require('../models/Guide');

router.get('/api/mysql/guides', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM guide';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const guides = [];
                for (const guide of result) {
                    //create new object
                    guides.push(new Guide(guide.guide_id, guide.first_name, guide.last_name, guide.email, guide.phone, guide.license, guide.rating));
                }
                res.send(guides);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
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
        console.log(req.body);
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

module.exports = {
  router,
};
