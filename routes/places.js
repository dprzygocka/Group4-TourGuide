const router = require('express').Router();
const { pool, sequelize } = require('../database/connection');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const { Place } = require('../models/Place.js');

router.get('/api/mysql/places', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'place_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        sequelize.query(`CALL PaginateSort(:table, :column, :direction, :size, :page)`,
            {
                replacements: {
                    table: 'place', 
                    column: sortColumn,
                    direction: direction,
                    size: size,
                    page: page,
                }
            })
        .then((places) => res.send(places)).catch((err) => res.send(err));   
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});

router.get('/api/mysql/places/:place_id', (req, res) => {
    Place.findOne({
        where: {
            id: req.params.place_id
        }
    }).then((place) => res.send(place)).catch((err) => res.send(err));
});

router.post('/api/mysql/places', (req, res) => {
    Place.create({ 
        placeName: req.body.placeName 
    }).then((place) => res.send(place)).catch((err) => res.send(err));
});

router.delete('/api/mysql/places/:place_id', (req, res) => {
    Place.destroy({
        where: {
            id: req.params.place_id
        }
    }).then(() => res.send("Place deleted")).catch((err) => res.send(err));
});

router.patch('/api/mysql/places/:place_id', (req, res) => {
    Place.update({ placeName: req.body.placeName }, {
        where: {
          id: req.params.place_id
        }
    }).then(() => res.send("Place name updated")).catch((err) => res.send(err));
});

module.exports = {
  router,
};
