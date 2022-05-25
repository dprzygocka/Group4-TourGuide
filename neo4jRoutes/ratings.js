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
        const rating = await session.run(`CREATE (r:Rating {ratingId: "${uuidv4()}", rating: ${req.body.rating},type: "${req.body.type}", comment: "${req.body.comment}"}) RETURN r.ratingId AS ratingId`);

        const schedule = await instance.first('Schedule', 'scheduleId', req.body.scheduleId);
        const jsonSchedule = await schedule.toJson();

        const relationashipType = req.body.type === 'TOUR' ? 'ASSIGNED_TO' : 'guides';

        const tourOrGuideId = await session.run(`
        MATCH (s:Schedule {scheduleId: '${req.body.scheduleId}'})
        -[:${relationashipType}]-(${req.body.type.toLowerCase()})
        RETURN ${req.body.type.toLowerCase()}.tourId AS id;
        `)
        const result = tourOrGuideId.records[0].get('id');

        const allRatings = await session.run(`
            MATCH (r:Rating {type: '${req.body.type}'})-[:REFERS_TO]-(schedule)
            -[:${relationashipType}]-(${req.body.type.toLowerCase()} { ${req.body.type.toLowerCase()}Id: '${result}'})
            RETURN r.rating AS rating;
        `)
        const ratingsCount = allRatings.records.length;
        const ratingsValue = allRatings.records.map( (rating) => rating.get('rating')).reduce((previous, next) => previous + next);
/*
        if (rating && schedule && new Date(jsonSchedule.scheduleDateTime) >= new Date()) {
            throw new Error('You cannot rate schedules from the future.');
        } else if (!rating) {
            throw new Error('Rating not created.');
        } */
        await session.run(`MATCH (r:Rating), (s:Schedule) WHERE r.ratingId = "${rating.records[0].get('ratingId')}" AND s.scheduleId = "${req.body.scheduleId}" CREATE (r)-[z:REFERS_TO]->(s) RETURN type(z)`);

        await session.run(`MATCH (r:Rating), (c:Customer) 
        WHERE r.ratingId = "${rating.records[0].get('ratingId')}" AND c.customerId = "${req.body.customerId}"
        CREATE (c)-[z:WRITES]->(r)
        RETURN type(z)`);

        const ratingType = req.body.type === 'TOUR' ? 'Tour' : 'Guide';
        await session.run(`MATCH (r:${ratingType}) WHERE r.${ratingType.toLowerCase()}Id = "${result}" SET r.rating = ${(ratingsValue/ratingsCount).toFixed(2)}`);

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