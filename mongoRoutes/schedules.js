const router = require('express').Router();
const Schedule = require('../mongoModels/Schedule.js');
const mongodb = require('../Database/connection_mongo');
const {checkDirection, checkSortColumn} = require('../models/Utils');


router.get('/api/mongodb/schedules', async(req, res) => {
    const sortColumn = req.query.sortColumn || '_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    const sortData = {};
    sortData[sortColumn] = direction;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        try {
            const schedules = await Schedule.find().skip(page).limit(size).sort(sortData).exec();
            res.send(schedules);
        } catch (error) {
            res.send(error);
        }
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});


router.get('/api/mongodb/schedules/:schedule_id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.schedule_id);
        res.send(schedule);
    } catch (error) {
        res.send(error);
    }
});

router.post('/api/mongodb/schedules', async(req, res) => {
    try {
        const schedule = await Schedule.create({
            schedule_datetime: req.body.dateTime,
            //pass also ids here?
            guide: {
                _id: req.body.guide.guide_id,
                firstName: req.body.guide.firstName, 
                lastName:  req.body.guide.lastName, 
                license: req.body.guide.license,
                phone: req.body.guide.phone,
                email: req.body.guide.email,
                contractEndDate: req.body.guide.contractEndDate
            },
            tour: {
                _id: req.body.tour.tour_id,
                difficulty: req.body.tour.difficulty,
                price: req.body.tour.price,
                duration: req.body.tour.duration,
                number_of_spots: req.body.tour.numberOfSpots,
                age_limit: req.body.tour.ageLimit,
                distance: req.body.tour.distance,
                description: req.body.tour.description,
                place_of_departure_name: req.body.tour.placeOfDeparture,
                place_of_destination_name: req.body.tour.placeOfDestination,
                is_active: req.body.tour.isActive
            }
        })
        res.send(schedule);
    } catch (error) {
        res.send(error);
    }
});

router.delete('/api/mongodb/schedules/:schedule_id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.schedule_id)
        res.send('Schedule deleted');
    } catch (error) {
        res.send(error);
    }
});

module.exports = {
  router,
};