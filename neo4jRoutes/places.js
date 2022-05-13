const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();

router.get('/api/neo4j/places', (req, res) => {
        instance.all('Place')
        .then(collection => {
            res.send(collection.get(1).get('placeName'));
    })
});

module.exports = {
    router,
};