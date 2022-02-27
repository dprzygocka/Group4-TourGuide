const router = require('express').Router();
const { pool } = require('../database/connection');

const { Customer } = require('../models/customer');



router.get('/api/mysql/customers', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM customer';
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

router.get('/api/mysql/customers/:customer_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM customer WHERE customer_id = ?';
        db.query(query, [req.params.customer_id], (error, result, fields) => {
            if (result && result.length) {
                res.send(new Customer(result[0].customer_id, result[0].first_name, result[0].last_name, result[0].email, result[0].phone, result[0].password));
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
