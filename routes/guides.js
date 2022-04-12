const router = require('express').Router();
const { pool, sequelize } = require('../database/connection');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const { Guide } = require('../models/Guide');

router.get('/api/mysql/guides', (req, res) => {
    const sortColumn = req.query.sortColumn || 'guide_id';
    const direction = req.query.direction || 'ASC';
    const size = req.query.size || 10;
    //paging starts from 0
    const page = req.query.page - 1 || 0;
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        sequelize.query(`CALL PaginateSort(:table, :column, :direction, :size, :page)`,
            {
                replacements: {
                    table: 'guide', 
                    column: sortColumn,
                    direction: direction,
                    size: size,
                    page: page,
                }
            })
        .then((guides) => res.send(guides)).catch((err) => res.send(err));       
    } else {
        res.send({
            message: `Check your input:\nsort column: ${sortColumn}\ndirection: ${direction}\nsize: ${size}\npage: ${page}\n`
        })
    }
});

router.get('/api/mysql/guides/:guide_id', (req, res) => {
    Guide.findOne({
        where: {
            id: req.params.guide_id
        }
    }).then((guide) => res.send(guide)).catch((err) => res.send(err));
});

router.post('/api/mysql/guides', (req, res) => {
    Guide.create({ 
        firstName: req.body.firstName, 
        lastName:  req.body.lastName, 
        license: req.body.license,
        phone: req.body.phone,
        email: req.body.email,
        contractEndDate: req.body.contractEndDate
    }).then((guide) => res.send(guide)).catch((err) => res.send(err));
});

router.delete('/api/mysql/guides/:guide_id', (req, res) => {
    Guide.destroy({
        where: {
            id: req.params.guide_id
        }
    }).then(() => res.send("Guide deleted")).catch((err) => res.send(err));
});

module.exports = {
  router,
};
