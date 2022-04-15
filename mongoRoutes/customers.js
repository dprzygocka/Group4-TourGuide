const router = require('express').Router();
const Customer = require('../mongoModels/Customer.js');
const bcrypt = require("bcrypt");
const {checkDirection, checkSortColumn} = require('../models/Utils');

const saltRounds = 15;

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


module.exports = {
  router,
};