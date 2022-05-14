const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');

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

router.get('/api/neo4j/places/:place_id', (req, res) => {
    instance.find('Place', req.params.place_id).then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/places', (req, res) => {
    instance.create('Place', {
        placeId: uuidv4(),
        placeName: req.body.placeName 
    }).then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.delete('/api/neo4j/places/:place_id', (req, res) => {
    instance.find('Place', req.params.place_id).then(res => {
        return res.delete();
    })
    .then(deleted => {
        res.send(deleted._deleted);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

module.exports = {
    router,
};