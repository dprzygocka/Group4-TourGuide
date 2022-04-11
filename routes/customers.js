const router = require('express').Router();
//const { pool } = require('../database/connection');
const bcrypt = require("bcrypt");
const { Customer } = require('../models/customer');
const { sequelize } = require('../database/connection');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const saltRounds = 15;

router.get('/api/mysql/customers', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'customer_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        try {
            const customers = await sequelize.query(`CALL PaginateSort(:table, :column, :direction, :size, :page)`,
                {
                    replacements: {
                        table: 'customer', 
                        column: sortColumn,
                        direction: direction,
                        size: size,
                        page: page,
                    }
                })
            res.send(customers);
        } catch (error) {
            res.send(error);
        }
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});

router.get('/api/mysql/customers/:customer_id', async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                id: req.params.customer_id
            }
        })
        res.send(customer);
    } catch (error) {
        res.send(error);
    }
});
/*
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
*/
module.exports = {
  router,
};
