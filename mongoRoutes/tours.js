const router = require('express').Router();
const Tour = require('../mongoModels/Tour.js');
const mongodb = require('../Database/connection_mongo');
const {checkDirection, checkSortColumn} = require('../models/Utils');


router.get('/api/mongodb/tours', async(req, res) => {
    try {
        const tours = await Tour.find();
        res.send(tours);
    } catch (error) {
          res.send(error);
    }
});


router.get('/api/mongodb/tours/:tour_id', async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.tour_id);
        res.send(tour);
    } catch (error) {
        res.send(error);
    }
});

router.post('/api/mongodb/tours', async(req, res) => {
    try {
        const tour = await Tour.create({
            difficulty: req.body.difficulty,
            price: req.body.price,
            duration: req.body.duration,
            number_of_spots: req.body.numberOfSpots,
            age_limit: req.body.ageLimit,
            distance: req.body.distance,
            description: req.body.description,
            place_of_departure_name: req.body.placeOfDeparture,
            place_of_destination_name: req.body.placeOfDestination,
            is_active: req.body.isActive
        })
        res.send(tour);
    } catch (error) {
        res.send(error);
    }
});

router.delete('/api/mongodb/tours/:tour_id', async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.tour_id)
        res.send('Tour deleted');
    } catch (error) {
        res.send(error);
    }
});

router.put('/api/mongodb/tours/:tour_id', async (req, res) => {
    try {
        await Tour.findByIdAndUpdate(req.params.tour_id, {
            difficulty: req.body.difficulty,
            price: req.body.price,
            duration: req.body.duration,
            number_of_spots: req.body.numberOfSpots,
            age_limit: req.body.ageLimit,
            distance: req.body.distance,
            description: req.body.description,
            place_of_departure_name: req.body.placeOfDeparture,
            place_of_destination_name: req.body.placeOfDestination,
            is_active: req.body.isActive
        })
        res.send("Tour updated");
    } catch (error) {
        res.send(error);
    }
});

//update one field
router.patch('/api/mongodb/tours/:tour_id', async (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    //we can restrict fields to update here
    if (!fieldName || fieldName === '_id' || !fieldValue ) {
        res.send({
            message: 'Nothing to update',
        });
        return;
    }
    //dynamically assign value to update
    const updateData = {};
    updateData[fieldName] = fieldValue;
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.tour_id, updateData)
        res.send(`Tour updated`);
    } catch (error) {
        res.send(error);
    }
});


module.exports = {
  router,
};