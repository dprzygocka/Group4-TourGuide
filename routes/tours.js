const router = require('express').Router;
const { pool } = require('../database/connection');
const { Guide } = require('./User');

router.get('/api/mysql/tours', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tour';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const customers = [];
                for (const customer of result) {
                    //create new object
                    customers.push(new Customer(customer.customer_id, customer.first_name, customer.last_name, customer.email, customer.phone, customer.password));
                }
                res.send(customers);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});