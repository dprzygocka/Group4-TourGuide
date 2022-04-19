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
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
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

router.post('/api/mysql/customers/register', async (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, async (error, hash) => {
        if (!error) {
            try {
                const customer = await Customer.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email,
                    password: hash,
                })
                res.send(customer);
            } catch (error) {
                res.send(error);
            }
        } else {
            res.status(500).send({
                message: "Something went wrong. Try again."
            });
        }
    });
});

router.post('/api/mysql/customers/login', async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                email: req.body.email
            }
        })
        bcrypt.compare(req.body.password, customer.password, (error, match) => {
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
    } catch (error) {
        res.send(error);
    }
});

router.patch('/api/mysql/customers/unregister', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const customer = await Customer.findOne({
            where: {
                email: req.body.email
            }
        }, {transaction: transaction})
        //if retrieved password matches provided one, set password to null
        bcrypt.compare(req.body.password, customer.password, async (error, match) => {
            if (match) {
                const count = await Customer.update({
                    password: null,
                }, {
                    where: {
                        email: req.body.email,
                    }
                }, {transaction: transaction})
                await transaction.commit();
                if (count[0] !== 0) {
                    res.send("Customer unregistered");
                } else {
                    res.send("Customer with provided email and password not found");
                }
            } else {
                await transaction.rollback();
                res.send(error);
            }
        })
    } catch (error) {
        await transaction.rollback();
        res.send(error);
    }
});

module.exports = {
  router,
};
