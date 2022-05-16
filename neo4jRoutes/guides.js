const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/neo4j/guides', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'guideId';
    const direction = req.query.direction || 'ASC';
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
    const skip = page * size;
    const order = {[sortColumn]: direction};
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        instance.all('Guide', {}, order, size, skip).then(res => {
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

router.get('/api/neo4j/guides/:guide_id', (req, res) => {
    instance.find('Guide', req.params.guide_id).then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/guides', (req, res) => {
    Promise.all([
        instance.create('Guide', {
            guideId: uuidv4(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            license: req.body.license,
            email: req.body.email,
            phone: req.body.phone,
            rating: req.body.rating,
            contractEndDate: req.body.contractEndDate,
        }),
        instance.first('Schedule', 'scheduleId', req.body.scheduleId),
    ]).then(([guide, schedule]) => {
        Promise.all([
            guide.relateTo(schedule, 'guides'),
        ])
        return guide;
    }).then((guide) => {
        return guide.toJson();
    }).then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.delete('/api/neo4j/guides/:guide_id', (req, res) => {
    instance.find('Guide', req.params.guide_id).then(res => {
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