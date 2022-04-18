const router = require('express').Router();
const Guide = require('../mongoModels/Guide.js');
const {checkDirection, checkSortColumn} = require('../models/Utils');

router.get('/api/mongodb/guides', (req, res) => {
    const sortColumn = req.query.sortColumn || 'guide_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
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
    await Guide.create({ 
        firstName: req.body.firstName, 
        lastName:  req.body.lastName, 
        license: req.body.license,
        phone: req.body.phone,
        email: req.body.email,
        contractEndDate: req.body.contractEndDate
     }, 
      (err, guide) => {
        if (err) {
          res.send(err);
        } else {
          res.send(guide);
        }
    });
  });
  
  router.delete('/api/mongodb/guides/:guide_id', (req, res) => {
    Guide.findByIdAndDelete(req.params.guide_id).then(() => res.send("Guide deleted")).catch((err) => res.send(err));
  });


module.exports = {
  router,
};