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

module.exports = {
  router,
};
