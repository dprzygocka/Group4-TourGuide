const {instance, driver} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/neo4j/places', (req, res) => {
    const sortColumn = req.query.sortColumn || 'placeId';
    const direction = req.query.direction || 'ASC';
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
    const skip = page * size;
    const order = {[sortColumn]: direction};
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        instance.all('Place', {}, order, size, skip).then(res => {
            return res.toJson();
        })
        .then(json => {
            res.send(json);
        })
        .catch(e => {
            res.status(500).send(e.stack);
        });
    }
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

router.delete('/api/neo4j/places/:place_id', async (req, res) => {
    const session = driver.session().beginTransaction();
    try {
        await session.run(`MATCH (tour:Tour)-[:STARTS_IN]->(place:Place)
            WHERE place.placeId = $placeId
            SET tour.isActive = false;`, {placeId: req.params.place_id});
        await session.run(`MATCH (tour:Tour)-[:LEADS_TO]->(place:Place)
            WHERE place.placeId = $placeId
            SET tour.isActive = false;`, {placeId: req.params.place_id});   
        //delete relationship
        await session.run(`MATCH (tour:Tour)-[r:STARTS_IN]->(place:Place) WHERE place.placeId = $placeId 
            DELETE r` , {placeId: req.params.place_id});;
        //delete both relationship and node
        const deleted = await session.run(`MATCH (tour:Tour)-[r:LEADS_TO]->(place:Place) WHERE place.placeId = $placeId 
            DELETE r, place` , {placeId: req.params.place_id});
        session.commit();
        res.send(deleted.summary.counters._stats.nodesDeleted > 0 ? 'deleted' : 'not deleted');
    } catch (e) {
        await session.rollback();
        res.status(500).send(e.stack); 
    } finally {
        await session.close();
    }
});

module.exports = {
    router,
};