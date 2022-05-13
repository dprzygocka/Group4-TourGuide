const Neode = require('neode');
require('dotenv').config();
const router = require('express').Router();
const instance = new Neode(process.env.NEO4J_URI, process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD, true).with({
    Place: require('../neo4jModels/Place'),
    Tour: require('../neo4jModels/Tour'),
    Schedule: require('../neo4jModels/Schedule'),
});

module.exports = { instance };