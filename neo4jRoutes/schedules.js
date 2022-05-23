const {instance, driver} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');

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
        const schedule = await instance.create('Schedule', {
                scheduleId: uuidv4(),
                scheduleDateTime: req.body.dateTime,
            });
        const tour = await instance.first('Tour', 'tourId', req.body.tourId);
        const guide = await instance.first('Guide', 'guideId', req.body.guideId);
        await schedule.relateTo(tour, 'assigned_to'),
        await schedule.relateTo(guide, 'guides'),
        await schedule.update({'numberOfFreeSpots': tour.get('numberOfSpots')})
        res.send(await schedule.toJson());
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