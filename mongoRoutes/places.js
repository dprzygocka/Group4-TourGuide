const router = require('express').Router();
const Place = require('../mongoModels/Place.js');

router.post('/api/mongodb/places', async (req, res) => {
    const place = new Place({ 
        placeName: req.body.placeName 
    })
    await place.save();
    res.send(place);
});

module.exports = {
  router,
};