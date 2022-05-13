const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();

router.get('/api/neo4j/places', (req, res) => {
        instance.find("Place", '1')
        .then(r => {
            res.send(r);
    })
});

module.exports = {
    router,
};