const router = require('express').Router();
const {Guide} = require('../mongoModels/Guide.js');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mongodb/guides', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'guide_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    const sortData = {};
    sortData[sortColumn] = direction;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {   
      try {
        const guides = await Guide.find().skip(page).limit(size).sort(sortData);
        res.send(guides);
      } catch (error) {
          res.send(error);
      }  
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});

router.get('/api/mongodb/guides/:guide_id', (req, res) => {
    Guide.findById(req.params.guide_id).then((guide) => res.send(guide)).catch((err) => res.send(err));
  });
  
router.post('/api/mongodb/guides', async (req, res) => {
    try {
        const guide = await Guide.create({ 
        firstName: req.body.firstName, 
        lastName:  req.body.lastName, 
        license: req.body.license,
        phone: req.body.phone,
        email: req.body.email,
        contractEndDate: req.body.contractEndDate
     });
     res.send(guide);
    } catch (error) {
      res.send(error);
    }
});

router.patch('/api/mongodb/guides/:guide_id/rating', async (req, res) => {
    try {
        const guide = await Guide.findByIdAndUpdate(
        req.params.guide_id, 
        {$push: {guide_ratings: req.body.guideRating}});
        res.send(guide);
    } catch (error) {
        res.send(error);
    }
});
  
router.delete('/api/mongodb/guides/:guide_id', (req, res) => {
    Guide.findByIdAndDelete(req.params.guide_id).then(() => res.send("Guide deleted")).catch((err) => res.send(err));
});


module.exports = {
  router,
};