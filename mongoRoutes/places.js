const router = require('express').Router();
const Place = require('../mongoModels/Place.js');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mongodb/places', async (req, res) => {
  const sortColumn = req.query.sortColumn || 'place_id';
  const direction = req.query.direction || 'ASC';
  const size = req.query.size || 10;
  //paging starts from 0
  const page = req.query.page - 1 || 0;
  if (checkSortColumn(sortColumn) && checkDirection(direction)) {
      try {
        const places = await Place.find().skip(page).limit(size).sort(sortData);
        res.send(places);
      } catch (error) {
          res.send(error);
      } 
  } else {
      res.send({
          message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
      })
  }
});

router.get('/api/mongodb/places/:place_id', (req, res) => {
  Place.findById(req.params.place_id).then((place) => res.send(place)).catch((err) => res.send(err));
});

router.post('/api/mongodb/places', async (req, res) => {
  try {
    const place = await Place.create({ placeName: req.body.placeName });
    res.send(place);
  } catch (error) {
    res.send(error)
  }
});

router.delete('/api/mongodb/places/:place_id', (req, res) => {
  Place.findByIdAndDelete(req.params.place_id).then(() => res.send("Place deleted")).catch((err) => res.send(err));
});

module.exports = {
  router,
};