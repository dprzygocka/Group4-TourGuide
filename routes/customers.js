const router = require('express').Router();
const { pool } = require('../database/connection');
const bcrypt = require("bcrypt");
const { Customer } = require('../models/customer');

const saltRounds = 15;

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

router.post('/api/mysql/customers/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
        if (!error) {
            pool.getConnection((err, db) => {
                let query = 'INSERT INTO customer (first_name, last_name, phone, email, password) VALUES (?, ?, ?, ?, ?)';
                db.query(query, [req.body.firstName, req.body.lastName, req.body.phone, req.body.email, hash], (error, result, fields) => {
                    if (result && result.affectedRows === 1) {
                        res.send({
                            message: 'Customer successfully added.',
                        });
                    } else {
                        res.send({
                            message: 'Something went wrong',
                        });
                    }
                });
                db.release();
            });
        } else {
            res.status(500).send({
                message: "Something went wrong. Try again."
            });
        }
    });
});

module.exports = {
  router,
};
