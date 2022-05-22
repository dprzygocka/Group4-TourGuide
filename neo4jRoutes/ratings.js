const {instance, driver} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/neo4j/ratings', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'ratingId';
    const direction = req.query.direction || 'ASC';
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
    const skip = page * size;
    const order = {[sortColumn]: direction};
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        instance.all('Rating', {}, order, size, skip).then(res => {
            return res.toJson();
        })
        .then(json => {
            return res.send(json);
        })
        .catch(e => {
            res.status(500).send(e.stack);
        });
    }
});

router.get('/api/neo4j/ratings/:rating_id', (req, res) => {
    instance.find('Rating', req.params.rating_id).then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/ratings', async (req, res) => {
    const session = driver.session().beginTransaction();
    try {
        const rating = await instance.create('Rating', {
            ratingId: uuidv4(),
            rating: req.body.rating, 
            type: req.body.type,
            comment: req.body.comment,
        });

        const schedule = await instance.first('Schedule', 'scheduleId', req.body.scheduleId);
        const jsonSchedule = await schedule.toJson();
        const customer = await instance.first('Customer', 'customerId', req.body.customerId);

        if (rating && schedule && new Date(jsonSchedule.scheduleDateTime) >= new Date()) {
            throw new Error('You cannot rate schedules from the future.');
        } else if (!rating) {
            throw new Error('Rating not created.');
        }

        await rating.relateTo(schedule, 'refers_to', {});
        await rating.relateTo(customer, 'writes', {});

        await session.commit();
        res.send("Rating created!");
    } catch (e) {
        await session.rollback();
        res.status(500).send(e.stack); 
    } finally {
        await session.close();
    }
});

router.delete('/api/neo4j/ratings/:rating_id', (req, res) => {
    instance.find('Rating', req.params.rating_id).then(res => {
        return res.delete();
    })
    .then(deleted => {
        res.send(deleted._deleted);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.patch('/api/neo4j/ratings/:rating_id', async (req, res) => {
    instance.find('Rating', req.params.rating_id).then(rating => {
        rating.update({"rating": req.body.rating, "comment": req.body.comment}).then((rating) => {
            return rating.toJson();
        }).then(json => {
            res.send(json);
        })
    }).catch(e => {
        res.status(500).send(e.stack);
    });
});

module.exports = {
    router,
};