const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/neo4j/tours', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'placeId';
    const direction = req.query.direction || 'ASC';
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
    const skip = page * size;
    const order = {[sortColumn]: direction};
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        instance.all('Tour', {}, order, size, skip).then(res => {  
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

router.get('/api/neo4j/tours/:tour_id', async (req, res) => {
    instance.find('Tour', req.params.tour_id).then(res => {
        console.log(res);
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

//get fulltext index

router.post('/api/neo4j/tours', (req, res) => {
    Promise.all([
        instance.create('Tour', {
            tourId: uuidv4(),
            difficulty: req.body.difficulty,
            price: req.body.price,
            duration: req.body.duration,
            numberOfSpots: req.body.numberOfSpots,
            ageLimit: req.body.ageLimit,
            distance: req.body.distance,
            description: req.body.description,
            isActive: req.body.isActive
        }),
        instance.first('Place', 'placeName', req.body.placeOfDeparture),
        instance.first('Place', 'placeName', req.body.placeOfDestination),
    ]).then(([tour, placeOfDeparture, placeOfDestination]) => {
        Promise.all([
            tour.relateTo(placeOfDeparture, 'starts_in'),
            tour.relateTo(placeOfDestination, 'leads_to')
        ])
        return tour;
    }).then((tour) => {
        return tour.toJson();
    }).then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.delete('/api/neo4j/tours/:tour_id', async (req, res) => {
    instance.find('Tour', req.params.tour_id).then(res => {
        return res.delete();
    })
    .then(deleted => {
        res.send(deleted._deleted);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.put('/api/neo4j/tours/:tour_id', async (req, res) => {
    instance.find('Tour', req.params.tour_id).then(tour => {
        tour.update({
            difficulty: req.body.difficulty,
            price: req.body.price,
            duration: req.body.duration,
            numberOfSpots: req.body.numberOfSpots,
            ageLimit: req.body.ageLimit,
            distance: req.body.distance,
            description: req.body.description,
            isActive: req.body.isActive
        }).then((tour) => {
            return tour.toJson();
        }).then(json => {
            res.send(json);
        })
    }).catch(e => {
        res.status(500).send(e.stack);
    });
});

router.patch('/api/neo4j/tours/:tour_id', async (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    //we can restrict fields to update here
    if (!fieldName || fieldName === 'tourId' || !fieldValue ) {
        res.send({
            message: 'Nothing to update',
        });
        return;
    }
    //dynamically assign value to update
    const updateData = {};
    updateData[fieldName] = fieldValue;
    instance.find('Tour', req.params.tour_id).then(tour => {
        tour.update(updateData).then((tour) => {
            return tour.toJson();
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