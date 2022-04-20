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


module.exports = {
  router,
};