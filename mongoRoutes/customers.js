const router = require('express').Router();
const Customer = require('../mongoModels/Customer.js');
const bcrypt = require("bcrypt");
const mongodb = require('../Database/connection_mongo');
const {checkDirection, checkSortColumn} = require('../models/Utils');

const saltRounds = 15;

router.get('/api/mongodb/customers', async (req, res) => {
    const sortColumn = req.query.sortColumn || '_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    const sortData = {};
    sortData[sortColumn] = direction;
        if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        try {
            const customers = await Customer.find().skip(page).limit(size).sort(sortData).exec();
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

router.get('/api/mongodb/customers/:customer_id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customer_id);
        res.send(customer);
    } catch (error) {
        res.send(error);
    }
});

router.post('/api/mongodb/customers/register', async (req, res) => {
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

router.post('/api/mongodb/customers/login', async (req, res) => {
    try {
        const customer = await Customer.findOne({
                email: req.body.email
        }).exec();
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

router.patch('/api/mongodb/customers/unregister', async (req, res) => {
    try {
		const session = await mongodb.startSession();
		session.startTransaction();
		try {
			const customer = await Customer.findOne({
					email: req.body.email
			})
			console.log(customer);
		/* //if retrieved password matches provided one, set password to null
			bcrypt.compare(req.body.password, customer.password, async (error, match) => {
				if (match) {
					const count = await Customer.findByIdAndUpdate({
						customer_id
					}, {
						$unset: {password: ""}
					})
					await session.commitTransaction();
					if (count[0] !== 0) {
						res.send("Customer unregistered");
					} else {
						res.send("Customer with provided email and password not found");
					}
				} else {
					await session.abortTransaction();
					res.send(error);
				}
			})*/
		} catch (error) {
			await session.abortTransaction();
			res.send(error);
		}
		await session.endSession();
	} catch (error) {
		console.log("error", error);
		res.send(error);
	}
});

module.exports = {
  router,
};