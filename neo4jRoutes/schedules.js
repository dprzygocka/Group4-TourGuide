const {instance} = require('../database/connection_neo4j');
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
    Promise.all([
        instance.create('Schedule', {
            scheduleId: uuidv4(),
            scheduleDateTime: req.body.dateTime,
        }),
        instance.first('Tour', 'tourId', req.body.tourId),
        instance.first('Guide', 'guideId', parseInt(req.body.guideId)),
    ]).then(async([schedule, tour, guide]) => {
        Promise.all([
            schedule.relateTo(tour, 'assigned_to'),
            schedule.relateTo(guide, 'guides'),
            schedule.update({'numberOfFreeSpots': tour.get('numberOfSpots')})
        ])
        return schedule;
    }).then((schedule) => {
        return schedule.toJson();
    }).then(json => {
        res.send(json);
    })
    .catch(e => {
        console.log(e);
        res.status(500).send(e.stack);
    });
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