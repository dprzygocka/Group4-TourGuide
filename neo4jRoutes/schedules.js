const {instance, driver} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const { numberOfSpots } = require('../neo4jModels/Tour');

router.get('/api/neo4j/schedules', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'scheduleId';
    const direction = req.query.direction || 'ASC';
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
    const skip = page * size;
    const order = {[sortColumn]: direction};
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        instance.all('Schedule', {}, order, size, skip).then(res => {  
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

router.get('/api/neo4j/scheduless/:schedule_id', async (req, res) => {
    instance.find('Schedule', req.params.schedule_id).then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/schedules', async (req, res) => {
    const session = driver.session().beginTransaction();
    try {
        const scheduleId = uuidv4();
        const numberOfSpots = await session.run(`MATCH (t:Tour) WHERE t.tourId = $tourId RETURN t.numberOfSpots`, {tourId: req.body.tourId})
        const schedule = await session.run(`CREATE (s:Schedule {scheduleId: $scheduleId, scheduleDateTime: $scheduleDateTime, numberOfFreeSpots: $numberOfFreeSpots})`, {
                scheduleId: scheduleId,
                scheduleDateTime: req.body.dateTime,
                numberOfFreeSpots: numberOfSpots.records[0]._fields[0].low,
            });
        await session.run(`MATCH (g:Guide), (s:Schedule) WHERE g.guideId = $guideId AND s.scheduleId = $scheduleId
            CREATE (g)-[r:GUIDES]->(s)
            RETURN type(r)`, {guideId: req.body.guideId, scheduleId: scheduleId});
        await session.run(`MATCH (t:Tour), (s:Schedule) WHERE t.tourId = $tourId AND s.scheduleId = $scheduleId
            CREATE (t)-[r:ASSIGNED_TO]->(s)
            RETURN type(r)`, {tourId: req.body.tourId, scheduleId: scheduleId});
        
        session.commit();
        res.send(schedule.summary.counters._stats.nodesCreated > 0 ? 'created' : 'not created');
    } catch (e) {
        await session.rollback();
        res.status(500).send(e.stack); 
    } finally {
        await session.close();
    }
});

router.delete('/api/neo4j/schedules/:schedule_id', async (req, res) => {
    instance.find('Schedule', req.params.schedule_id).then(res => {
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