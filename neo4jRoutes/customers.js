const {instance} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');
//transaction and hashing
router.get('/api/neo4j/customers', async (req, res) => {
    const sortColumn = req.query.sortColumn || 'customerId';
    const direction = req.query.direction || 'ASC';
    const size = Number(req.query.size) || 10;
    //paging starts from 0
    const page = Number(req.query.page - 1) || 0;
    const skip = page * size;
    const order = {[sortColumn]: direction};
    if (checkSortColumn(sortColumn) && checkDirection(direction)) {
        instance.all('Customer', {}, order, size, skip).then(res => {
            return res.toJson();
        })
        .then(json => {
            return res.send(json);
        })
        .catch(e => {
            res.status(500).send(e.stack);
        });
    }
});

router.get('/api/neo4j/customers/:customer_id', (req, res) => {
    instance.find('Customer', req.params.customer_id).then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/customers/register', (req, res) => {
    instance.create('Customer', {
        customerId: uuidv4(),
        firstName: req.body.firstName, 
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
    })
    .then(res => {
        return res.toJson();
    })
    .then(json => {
        res.send(json);
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/customers/login', (req, res) => {
    instance.first('Customer', 'email', req.body.email)
    .then(customer => {
        return customer.toJson();
    })
    .then(json => {
        if (json.password === req.body.password) {
            res.send({
                message: 'Customer logged in.',
            });
        } else {
            res.status(401).send({
                message: "Incorrect username or password. Try again."
            });
        }
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.post('/api/neo4j/customers/booking', (req, res) => {
    instance.first('Customer', 'email', req.body.email)
    .then(customer => {
        return customer.toJson();
    })
    .then(json => {
        if (json.password === req.body.password) {
            res.send({
                message: 'Customer logged in.',
            });
        } else {
            res.status(401).send({
                message: "Incorrect username or password. Try again."
            });
        }
    })
    .catch(e => {
        res.status(500).send(e.stack);
    });
});

router.patch('/api/neo4j/customers/unregister/:customer_id', async (req, res) => {
    instance.find('Customer', req.params.customer_id).then(customer => {
        customer.update({"password": req.body.password}).then((customer) => {
            return customer.toJson();
        }).then(json => {
            res.send(json);
        })
    }).catch(e => {
        res.status(500).send(e.stack);
    });
});


module.exports = {
    router,
};