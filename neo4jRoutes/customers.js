const {instance, driver} = require('../database/connection_neo4j');
const router = require('express').Router();
const {v4: uuidv4 } = require('uuid');
const {checkDirection, checkSortColumn} = require('../models/Utils');
const { schedule } = require('../neo4jModels/Tour');
const bcrypt = require("bcrypt");
const saltRounds = 15;

//transaction
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
    bcrypt.hash(req.body.password, saltRounds, async (error, hash) => {
        if (!error) {
            instance.create('Customer', {
                customerId: uuidv4(),
                firstName: req.body.firstName, 
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                password: hash
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
        } else {
            res.status(500).send({
                message: "Something went wrong. Try again."
            });
        }
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

router.post('/api/neo4j/customers/booking', async (req, res) => {
    let updatedNumberOfspots;
    let tourPrice;
    const session = driver.session().beginTransaction();
    try {
        let schedule = await instance.first('Schedule', 'scheduleId', req.body.scheduleId);
        let jsonSchedule = await schedule.toJson();

        if (jsonSchedule && new Date(jsonSchedule.scheduleDateTime) <= new Date(req.body.bookingDateTime)) {
            throw new Error('You cannot book schedules from the past.');
        } else if (!jsonSchedule) {
            throw new Error('Selected schedule doesn\'t exist.');
        }
        if (jsonSchedule.numberOfFreeSpots < req.body.numberOfSpots) {
            throw new Error('Not enough free spots.');
        }
        updatedNumberOfspots = jsonSchedule.numberOfFreeSpots - req.body.numberOfSpots;
        tourPrice = jsonSchedule.assigned_to.node.price;

        const bookingId = uuidv4();
        await session.run(`MATCH (s:Schedule), (c:Customer) 
        WHERE s.scheduleId = $scheduleId AND c.customerId = $customerId
        CREATE (c)-[z:BOOKS {
            bookingId: $bookingId,
            totalPrice: $totalPrice,
            bookingDateTime: $bookingDateTime,
            numberOfSpots: $numberOfSpots
        }]->(s)
        RETURN type(z)`,
        {
            scheduleId: req.body.scheduleId,
            customerId: req.body.customerId,
            bookingId: bookingId,
            totalPrice: tourPrice * req.body.numberOfSpots,
            bookingDateTime: req.body.bookingDateTime,
            numberOfSpots: req.body.numberOfSpots
        });
        await session.run(`MATCH (s:Schedule {scheduleId: $scheduleId}) SET s.numberOfFreeSpots = $numberOfFreeSpots`,
        {
            scheduleId: req.body.scheduleId, 
            numberOfFreeSpots: updatedNumberOfspots
        });

        await session.commit();
        res.send("Booking created!");
    
    } catch (e) {
        await session.rollback();
        res.status(500).send(e.stack); 
    } finally {
        await session.close();
    }
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