const router = require('express').Router();
const { sequelize } = require('../database/connection');
const { Tour } = require('../models/Tour');
const { Op } = require("sequelize");
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mysql/tours', async(req, res) => {
    const sortColumn = req.query.sortColumn || 'tour_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        try {
            const tours = await sequelize.query(`CALL PaginateSort(:table, :column, :direction, :size, :page)`,
                {
                    replacements: {
                        table: 'tour', 
                        column: sortColumn,
                        direction: direction,
                        size: size,
                        page: page,
                    }
                })
            res.send(tours);
        } catch (error) {
            res.send(error);
        }
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});


router.get('/api/mysql/tours/:tour_id', async (req, res) => {
    try {
        const tour = await Tour.findOne({
            where: {
                id: req.params.tour_id
            }
        })
        res.send(tour);
    } catch (error) {
        res.send(error);
    }
});

//need to discuss
router.get('/api/mysql/tours/description/:search_keys', async (req, res) => {
    console.log(req.params.search_keys);
    try {
        const tours = await Tour.findALL({
            where: {
                description: {
                    [Op.like]: `%${req.params.search_keys}%`
                }
            }
        })
        res.send(tours);
    } catch (error) {
        res.send(error);
    }
    /*
    pool.getConnection((err, db) => {
        let query = `select * from tour where match (description) against (?);`;
        db.query(query, [req.params.search_keys], (error, result, fields) => {
            if (result && result.length) {
                const tours = [];
                for (const tour of result) {
                    //create new object
                    tours.push(new Tour(tour.tour_id, tour.price, tour.duration, tour.number_of_spots, tour.difficulty, tour.age_limit, tour.place_of_departure_id, tour.distance, tour.description, tour.rating, tour.place_of_destination_id, tour.is_active));
                }
                res.send(tours);
            } else if (error) {
                res.send({
                    message: error.sqlMessage,
                });
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });*/
});


router.post('/api/mysql/tours', async(req, res) => {
    try {
        const tour = await Tour.create({
            difficulty: req.body.difficulty,
            price: req.body.price,
            duration: req.body.duration,
            numberOfSpots: req.body.numberOfSpots,
            ageLimit: req.body.ageLimit,
            distance: req.body.distance,
            description: req.body.description,
            placeOfDeparture: req.body.placeOfDeparture,
            placeOfDestination: req.body.placeOfDestination
        })
        res.send(tour);
    } catch (error) {
        res.send(error);
    }
});

router.delete('/api/mysql/tours/:tour_id', async (req, res) => {
    try {
        await Tour.destroy({
            where: {
                id: req.params.tour_id
            }
        })
        res.send('Tour deleted');
    } catch (error) {
        res.send(error);
    }
});

router.put('/api/mysql/tours/:tour_id', async (req, res) => {
    try {
        await Tour.update({
            difficulty: req.body.difficulty,
            price: req.body.price,
            duration: req.body.duration,
            numberOfSpots: req.body.numberOfSpots,
            ageLimit: req.body.ageLimit,
            distance: req.body.distance,
            description: req.body.description,
            placeOfDeparture: req.body.placeOfDeparture,
            placeOfDestination: req.body.placeOfDestination
        }, {
            where: {
                id: req.params.tour_id
            }
        })
        res.send("Tour updated");
    } catch (error) {
        res.send(error);
    }
});

//update one field
router.patch('/api/mysql/tours/:tour_id', async (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    //we can restrict fields to update here
    if (!fieldName || fieldName === 'tour_id' || !fieldValue ) {
        res.send({
            message: 'Nothing to update',
        });
        return;
    }
    //dynamically assign value to update
    const updateData = {};
    updateData[fieldName] = fieldValue;
    try {
        const tour = await Tour.update(updateData, {
            where: {
                id: req.params.tour_id
            }
        })
        res.send(`Tour updated`);
    } catch (error) {
        res.send(error);
    }
});

module.exports = {
    router,
  };