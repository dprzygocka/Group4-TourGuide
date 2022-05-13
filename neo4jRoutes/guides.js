const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();
/*
router.post('/api/neo4j/guide', (req, res) => {
    instance.create('Guide', {
        firstName: 'Adam',
        lastNamne: 'Smith',
        license: 'AXYT678',
        email: 'adam@gmsil.com',
        phone: '12332112',
        rating: 4.6,
        contractEndDate: '2022-06-01',


    })
    .then(guide => {
        console.log(adam.get('name')); // 'Adam'
    });
});
*/
router.get('/api/neo4j/guides', async (req, res) => {
    instance.all('Guide').then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});
module.exports = {
    router,
};