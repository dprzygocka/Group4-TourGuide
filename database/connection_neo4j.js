const Neode = require('neode');
require('dotenv').config();
const router = require('express').Router();
const instance = new Neode(process.env.NEO4J_URI, process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD, true).with({
    Place: require('../neo4jModels/Place'),
    Guide: require('../neo4jModels/Guide'),
    Rating: require('../neo4jModels/Rating'),
    Tour: require('../neo4jModels/Tour'),
    Schedule: require('../neo4jModels/Schedule'),
    Customer: require('../neo4jModels/Customer'),
});

module.exports = { instance };