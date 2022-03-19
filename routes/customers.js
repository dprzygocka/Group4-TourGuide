const router = require('express').Router();
const { pool } = require('../database/connection');
const bcrypt = require("bcrypt");
const { Customer } = require('../models/customer');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const saltRounds = 15;

router.get('/api/mysql/customers', (req, res) => {
    const sortColumn = req.query.sortColumn || 'customer_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        pool.getConnection((err, db) => {
            let query = `CALL PaginateSort(?, ?, ?, ?, ?)`;
            db.query(query, ['customer', sortColumn, direction, size, page], (error, result, fields) => {
                if (result && result.length && result[0].length) {
                    const customers = [];
                    for (const customer of result[0]) {
                        //create new object
                        customers.push(new Customer(customer.customer_id, customer.first_name, customer.last_name, customer.email, customer.phone, customer.password));
                    }
                    res.send(customers);
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

router.post('/api/mysql/customers/login', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM customer WHERE email = ?';
        db.query(query, [req.body.email], (error, result, fields) => {
            if (result && result.length) {
                bcrypt.compare(req.body.password, result[0].password, (error, match) => {
                    if (match) {
                        res.send({
                            message: 'Customer logged in.',
                        });
                    } else {
                        res.status(401).send({
                            message: "Incorrect username or password. Try again."
                        });
                    }
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
