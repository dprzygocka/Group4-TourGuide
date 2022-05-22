const Neode = require('neode');
var neo4j = require('neo4j-driver');
require('dotenv').config();

const instance = new Neode(process.env.NEO4J_URI, process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD, true).with({
    Place: require('../neo4jModels/Place'),
    Guide: require('../neo4jModels/Guide'),
    Rating: require('../neo4jModels/Rating'),
    Tour: require('../neo4jModels/Tour'),
    Schedule: require('../neo4jModels/Schedule'),
    Customer: require('../neo4jModels/Customer'),
});


const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));

module.exports = { instance, driver };