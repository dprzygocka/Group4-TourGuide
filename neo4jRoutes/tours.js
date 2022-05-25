const {instance, driver} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/neo4j/tours', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'tourId';
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
router.get('/api/neo4j/tours/description/:search_keys', async(req, res) => {
    instance.cypher(`CALL db.index.fulltext.queryNodes("Description", "${req.params.search_keys}") YIELD node RETURN node`)
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/tours', async (req, res) => {
    const session = driver.session().beginTransaction();
    try {
        const tour = await instance.create('Tour', {
                tourId: uuidv4(),
                difficulty: req.body.difficulty,
                price: req.body.price,
                duration: req.body.duration,
                numberOfSpots: req.body.numberOfSpots,
                ageLimit: req.body.ageLimit,
                distance: req.body.distance,
                description: req.body.description,
                isActive: req.body.isActive
            });
        const placeOfDeparture = await instance.first('Place', 'placeName', req.body.placeOfDeparture);
        const placeOfDestination = await instance.first('Place', 'placeName', req.body.placeOfDestination);
        await tour.relateTo(placeOfDeparture, 'starts_in');
        await tour.relateTo(placeOfDestination, 'leads_to');
        res.send(await tour.toJson());
    } catch (e) {
        await session.rollback();
        res.status(500).send(e.stack); 
    } finally {
        await session.close();
    }
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