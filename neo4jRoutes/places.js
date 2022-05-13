const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();

router.get('/api/neo4j/places', (req, res) => {
    instance.all('Place').then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

module.exports = {
    router,
};