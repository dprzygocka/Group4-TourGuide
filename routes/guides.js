// Marianna
const router = require('express').Router();
const { pool } = require('../database/connection');
const { Guide } = require('../models/Guide');

// Marianna
router.get('/api/mysql/guides', (req, res) => {
  pool.getConnection((err, db) => {
    const interactions = {};
    // get messages
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

module.exports = {
  router,
};
