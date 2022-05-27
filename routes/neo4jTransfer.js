const router = require('express').Router();
const { pool } = require('../database/connection');
const {v4: uuidv4 } = require('uuid');
const {instance, driver} = require('../database/connection_neo4j');
const { scheduleDateTime } = require('../neo4jModels/Schedule');

router.get('/api/places/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT place_name FROM place;';
        db.query(query, [], async (error, result, fields) => {
            //console.log(result);
            for(r of result) {
                instance.create('Place', {
                    placeId: uuidv4(),
                    placeName: r.place_name
                }).then(json => {
                    console.log(json);
                })
                .catch(e => {
                    console.log(e.stack);
                });
            }
        })
    })
});

router.get('/api/customers/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT * FROM customer;';
        db.query(query, [], async (error, result, fields) => {
            //console.log(result);
            for(r of result) {
                instance.create('Customer', {
                    customerId: uuidv4(),
                    firstName: r.first_name,
                    lastName: r.last_name,
                    phone: r.phone,
                    email: r.email,
                    password: r.password,
                }).then(json => {
                    console.log(json);
                })
                .catch(e => {
                    console.log(e.stack);
                });
            }
        })
    })
});

router.get('/api/guides/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT * FROM guide;';
        db.query(query, [], async (error, result, fields) => {
            //console.log(result);
            for(r of result) {
                //console.log(r);
                instance.create('Guide', {
                    guideId: uuidv4(),
                    firstName: r.first_name,
                    lastName: r.last_name,
                    phone: r.phone,
                    email: r.email,
                    license: r.license,
                    contractEndDate: r.contract_end_date,
                    rating: Number(r.rating)
                }).then(json => {
                    console.log(json);
                })
                .catch(e => {
                    console.log(e.stack);
                });
            }
        })
    })
});

async function getPlace(db, place_id, departure) {
    let query2 = `SELECT * FROM place WHERE place_id = ?;`;
    const result = await new Promise((resolve, reject) => db.query(query2, place_id, (error, result, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }));
    if (result && result[0]) {
        return result[0].place_name;
    } else if (place_id = 42 && departure) {
        return "The Round-Topped Rise";
    } else if (place_id == 110) {
        return 'The Hooded Cliff';
    }
}

router.get('/api/tours/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = `SELECT * FROM tour;`;
        db.query(query, [], async (error, result, fields) => {
            //console.log(result);
            for(r of result) {
                const tourId = uuidv4();
                if (r.tour_id !== -1) {
                    r.placeOfDeparture = await getPlace(db, r.place_of_departure_id, 1);
                    r.placeOfDestination = await getPlace(db, r.place_of_destination_id);
                    console.log(r);
                    const tour = await instance.create('Tour', {
                        tourId: uuidv4(),
                        difficulty: r.difficulty,
                        price: Number(r.price),
                        duration: Number(r.duration),
                        numberOfSpots: r.number_of_spots,
                        ageLimit: r.age_limit,
                        distance: Number(r.distance),
                        description: r.description,
                        isActive: r.is_active,
                        rating: Number(r.rating)
                    });
                const placeOfDeparture = await instance.first('Place', 'placeName', r.placeOfDeparture);
                const placeOfDestination = await instance.first('Place', 'placeName', r.placeOfDestination);
                await tour.relateTo(placeOfDeparture, 'starts_in');
                await tour.relateTo(placeOfDestination, 'leads_to');
                }
            }
        })
    })
});

router.get('/api/schedules/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let count = 0;
        let query = `SELECT schedule.schedule_date_time, schedule.schedule_id, schedule.number_of_free_spots,
            guide.first_name, guide.last_name, guide.license, guide.email, guide.phone, guide.rating AS guide_rating, guide.contract_end_date,
            tour.difficulty, tour.price, tour.duration, tour.number_of_spots, tour.age_limit, tour.distance, tour.rating AS tour_rating, tour.description, tour.is_active,
            place.place_name AS place_of_departure_name, tour.place_of_destination_id
            FROM guide 
            JOIN schedule ON guide.guide_id = schedule.guide_id 
            JOIN tour ON tour.tour_id = schedule.tour_id 
            JOIN place on tour.place_of_departure_id = place.place_id;`;
        db.query(query, [], async (error, result, fields) => {
            //console.log('error', error);
            if (result && result.length) {
                for (const r of result) {
                    //create new object
            
                    let entry = { schedule_datetime: r.schedule_date_time, numberOfFreeSpots: r.number_of_free_spots,
                            guide: { firstName: r.first_name, lastName: r.last_name, license: r.license, 
                                email: r.email, phone: r.phone, rating: r.guide_rating, contractEndDate: r.contract_end_date, guide_ratings: [] },
                            tour: { difficulty: r.difficulty, price: r.price, duration: r.duration, number_of_spots: r.number_of_spots, 
                                age_limit: r.age_limit, distance: r.distance, rating: r.tour_rating,
                                description: r.description, place_of_departure_name: r.place_of_departure_name, 
                                is_active: r.is_active, tour_ratings: []  } };
                    entry.tour.place_of_destination_name = await getPlace(db, r.place_of_destination_id);
                    //console.log('entry', entry);
                    let tour = await instance.all('Tour',{
                        difficulty: entry.tour.difficulty,
                        price: Number(entry.tour.price),
                        duration: Number(entry.tour.duration),
                        numberOfSpots: entry.tour.number_of_spots,
                        ageLimit: entry.tour.age_limit,
                        distance: Number(entry.tour.distance),
                        rating: Number(entry.tour.rating),
                        description: entry.tour.description,
                        isActive: entry.tour.is_active ? true : false,
                    });
                    //console.log('tour', tour._values.length);
                    //console.log('tour', tour._values[0]);
                    tour = tour._values[0];
                    let guide = await instance.all('Guide', {
                        firstName: entry.guide.firstName, 
                        lastName: entry.guide.lastName, 
                        license: entry.guide.license, 
                        email: entry.guide.email,
                        phone: entry.guide.phone,
                        rating: Number(entry.guide.rating),
                    });
                    //console.log('guide', guide._values[0]);
                    guide = guide._values[0];
                    entry.schedule_datetime = entry.schedule_datetime.toISOString().slice(0, 19)
                    entry.schedule_datetime = `${entry.schedule_datetime}+00:00`;
                    console.log(entry.schedule_datetime);
                    console.log( tour.get('numberOfSpots').low);
                    const schedule = await instance.create('Schedule', {
                        scheduleId: uuidv4(),
                        scheduleDateTime: new Date(entry.schedule_datetime),
                        numberOfFreeSpots: entry.numberOfFreeSpots
                    });
                    await schedule.relateTo(tour, 'assigned_to');
                    await schedule.relateTo(guide, 'guides');
                    //await schedule.update({'numberOfFreeSpots': tour.get('numberOfSpots')})
                }
            } else {
                console.log('nope');
            } 
        });
        db.release();
    });
});


router.get('/api/bookings/neo4j/all', async (req, res) => {
    const session = driver.session();
    
    pool.getConnection(async (err, db) => {
        let count = 0;
        let query = `SELECT customer.first_name, customer.last_name, customer.email, customer.password, customer.phone,
            booking.number_of_spots, booking.total_price, booking.booking_date_time,
            schedule.number_of_free_spots, schedule.schedule_date_time,
            tour.difficulty, tour.price, tour.duration, tour.number_of_spots, tour.age_limit, tour.distance, tour.rating AS tour_rating, tour.description, tour.is_active,
            place.place_name AS place_of_departure_name, tour.place_of_destination_id
            FROM customer
            JOIN booking ON customer.customer_id = booking.customer_id 
            JOIN schedule ON booking.schedule_id = schedule.schedule_id
            JOIN tour ON tour.tour_id = schedule.tour_id
            JOIN place on tour.place_of_departure_id = place.place_id;`;
        db.query(query, [], async (error, result, fields) => {
            //console.log('error', error);
            if (result && result.length) {
                for (const r of result) {
                    //create new object
                    let entry = { 
                        customer: { firstName: r.first_name, lastName: r.last_name, password: r.password, email: r.email, phone: r.phone},
                        tour: { difficulty: r.difficulty, price: r.price, duration: r.duration, number_of_spots: r.number_of_spots, 
                            age_limit: r.age_limit, distance: r.distance, rating: r.tour_rating,
                            description: r.description, place_of_departure_name: r.place_of_departure_name, 
                            is_active: r.is_active, tour_ratings: []  },
                        booking: {numberOfSpots: r.number_of_spots, totalPrice: r.total_price, bookingDateTime: r.booking_date_time},
                        schedule: {numberOfFreeSpots: r.number_of_free_spots, scheduleDateTime: r.schedule_date_time}
                        };
                    entry.tour.place_of_destination_name = await getPlace(db, r.place_of_destination_id);
                    let customer = await instance.all('Customer', {
                        firstName: entry.customer.firstName, 
                        lastName: entry.customer.lastName, 
                        password: entry.customer.password, 
                        email: entry.customer.email,
                        phone: entry.customer.phone,
                    });
                    customer = customer._values[0];
                    //console.log(customer.get('customerId'));
                    entry.schedule.scheduleDateTime = entry.schedule.scheduleDateTime.toISOString().slice(0, 19)
                    entry.schedule.scheduleDateTime += '+00:00';
                    
                    let schedule = await instance.batch([
                        {query: 'MATCH (s:Schedule {numberOfFreeSpots: $numberOfFreeSpots}) RETURN s;',
                        params: {
                            scheduleDateTime: entry.schedule.scheduleDateTime, 
                            numberOfFreeSpots: entry.schedule.numberOfFreeSpots
                        }}
                        
                    ]);
                    //console.log(schedule);
                    //console.log(schedule[0].records);
                    //console.log(entry.schedule.scheduleDateTime)
                    let finalSchedule = schedule[0].records.filter((r) => {
                        if (new Date(r._fields[0].properties.scheduleDateTime).getTime() == new Date(entry.schedule.scheduleDateTime).getTime()){// || new Date(r._fields[0].properties.scheduleDateTime) == new Date(entry.schedule.scheduleDateTime2)){
                            return r;
                        }
                    });
                    finalSchedule = finalSchedule[0]._fields[0];
                    console.log(finalSchedule.properties.scheduleId);
                    //console.log(schedule);
                    //console.log('SCHEDULES', schedule[0].records.length);
                    //console.log('SCHEDULES', schedule[0].records[0]._fields);
                    const scheduleId = finalSchedule.properties.scheduleId;
                    const customerId = customer.get('customerId');
                    const bookingId = uuidv4();
                    let bookingDateTime = new Date(entry.booking.bookingDateTime);
                    bookingDateTime = bookingDateTime.toISOString().slice(0, 19)
                    bookingDateTime += '+00:00';
                    console.log('scheduleId', scheduleId,
                        'customerId', customerId,
                        'bookingId', bookingId,
                        'totalPrice', Number(entry.booking.totalPrice),
                       ' bookingDateTime', bookingDateTime,
                        'numberOfSpots', Number(entry.booking.numberOfSpots)  );
                    let relationship = await instance.batch([
                        {query: `MATCH (s:Schedule {scheduleId: $scheduleId}), (c:Customer {customerId: $customerId})
                        CREATE (c)-[r:BOOKS {bookingId: $bookingId, totalPrice: $totalPrice, bookingDateTime: "$bookingDateTime", numberOfSpots: $numberOfSpots}]->(s)
                        RETURN type(r);`,
                        /*{query: `MATCH (s:Schedule {scheduleId: $scheduleId}), (c:Customer {customerId: $customerId})
                        RETURN  c`,*/
                        params: {
                            scheduleId: scheduleId,
                            customerId: customerId,
                            bookingId: bookingId,
                            totalPrice: Number(entry.booking.totalPrice),
                            bookingDateTime: bookingDateTime,
                            numberOfSpots: Number(entry.booking.numberOfSpots)  
                        }}
                    ]);
                    console.log(relationship);
                    /*console.log(relationship[0]);
                    console.log(relationship[0].summary.query)
                    console.log(relationship[0].summary.updateStatistics)*/
                }
            } else {
                console.log('nope');
            } 
        });
        db.release();
    });
});

router.get('/api/guideRatings/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let count = 0;
        let query = `SELECT customer.first_name, customer.last_name, customer.email, customer.password, customer.phone,
            guide.first_name AS guidefn, guide.last_name AS guideln, guide.license as guidel, guide.email as guidee, guide.phone as guidep, guide.rating AS guide_rating, guide.contract_end_date,
            guide_rating.rating, guide_rating.comment,
            schedule.number_of_free_spots, schedule.schedule_date_time
            FROM customer
            JOIN guide_rating ON customer.customer_id = guide_rating.customer_id 
            JOIN schedule ON guide_rating.schedule_id = schedule.schedule_id
            JOIN guide ON guide.guide_id = schedule.guide_id;`;
        db.query(query, [], async (error, result, fields) => {
            //console.log('error', error);
            if (result && result.length) {
                for (const r of result) {
                    //create new object
                    let entry = { 
                        customer: { firstName: r.first_name, lastName: r.last_name, password: r.password, email: r.email, phone: r.phone},
                        schedule: {numberOfFreeSpots: r.number_of_free_spots, scheduleDateTime: r.schedule_date_time},
                        guide: { firstName: r.guidefn, lastName: r.guideln, license: r.guidel, 
                            email: r.guidee, phone: r.guidep, rating: r.guide_rating, contractEndDate: r.contract_end_date, guide_ratings: [] },
                        rating: {rating: r.rating, comment: r.comment}    
                    };
                    const ratingId = uuidv4();
                    let rating = await instance.create('Rating', {
                        ratingId: ratingId,
                        rating: Number(entry.rating.rating), 
                        type: 'GUIDE',
                        comment: entry.rating.comment,
                    });
                    //console.log(guide); 
                    entry.schedule.scheduleDateTime = entry.schedule.scheduleDateTime.toISOString().slice(0, 19)
                    entry.schedule.scheduleDateTime += '+00:00';
                    let schedule = await instance.batch([
                        {query: 'MATCH (s:Schedule {numberOfFreeSpots: $numberOfFreeSpots}) RETURN s;',
                        params: {
                            scheduleDateTime: entry.schedule.scheduleDateTime, 
                            numberOfFreeSpots: entry.schedule.numberOfFreeSpots
                        }}
                        
                    ]);
                    let finalSchedule = schedule[0].records.filter((r) => {
                        if (new Date(r._fields[0].properties.scheduleDateTime).getTime() == new Date(entry.schedule.scheduleDateTime).getTime()){// || new Date(r._fields[0].properties.scheduleDateTime) == new Date(entry.schedule.scheduleDateTime2)){
                            return r;
                        }
                    });
                    finalSchedule = finalSchedule[0]._fields[0];
                    console.log(finalSchedule.properties.scheduleId);
                    let customer = await instance.all('Customer', {
                        firstName: entry.customer.firstName, 
                        lastName: entry.customer.lastName, 
                        password: entry.customer.password, 
                        email: entry.customer.email,
                        phone: entry.customer.phone,
                    });
                    customer = customer._values[0];
                    //console.log('schedule', schedule);
                    const scheduleId = finalSchedule.properties.scheduleId;
                    const customerId = customer.get('customerId');
                    console.log(scheduleId, customerId, ratingId)
                    let relationship = await instance.batch([
                        {query: `MATCH (gr:Rating {ratingId: $ratingId}), (c:Customer {customerId: $customerId})
                        CREATE (c)-[r:WRITES]->(gr)
                        RETURN type(r);`,
                        params: {
                            customerId: customerId,
                            ratingId: ratingId,
                        }}
                    ]);
                    console.log(relationship);
                    let relationship2 = await instance.batch([
                        {query: `MATCH (gr:Rating {ratingId: $ratingId}), (s:Schedule {scheduleId: $scheduleId})
                        CREATE (gr)-[r:REFERS_TO]->(s)
                        RETURN type(r);`,
                        params: {
                            scheduleId: scheduleId,
                            ratingId: ratingId,
                        }}
                    ]);
                    console.log(relationship2);
                }
            } else {
                console.log('nope');
            } 
        });
        db.release();
    });
});

router.get('/api/tourRatings/neo4j/all', async (req, res) => {
    pool.getConnection(async (err, db) => {
        let count = 0;
        let query = `SELECT customer.first_name, customer.last_name, customer.email, customer.password, customer.phone,
            tour.difficulty, tour.price, tour.duration, tour.number_of_spots, tour.age_limit, tour.distance, tour.rating AS tour_rating, tour.description, tour.is_active,
            place.place_name AS place_of_departure_name, tour.place_of_destination_id,
            tour_rating.rating, tour_rating.comment,
            schedule.number_of_free_spots, schedule.schedule_date_time
            FROM customer
            JOIN tour_rating ON customer.customer_id = tour_rating.customer_id 
            JOIN schedule ON tour_rating.schedule_id = schedule.schedule_id
            JOIN tour ON tour.tour_id = schedule.tour_id
            JOIN place on tour.place_of_departure_id = place.place_id;`;
        db.query(query, [], async (error, result, fields) => {
            //console.log('error', error);
            if (result && result.length) {
                for (const r of result) {
                    //create new object
                    let entry = { 
                        customer: { firstName: r.first_name, lastName: r.last_name, password: r.password, email: r.email, phone: r.phone},
                        schedule: {numberOfFreeSpots: r.number_of_free_spots, scheduleDateTime: r.schedule_date_time},
                        tour: { difficulty: r.difficulty, price: r.price, duration: r.duration, number_of_spots: r.number_of_spots, 
                            age_limit: r.age_limit, distance: r.distance, rating: r.tour_rating,
                            description: r.description, place_of_departure_name: r.place_of_departure_name, 
                            is_active: r.is_active, tour_ratings: []  },
                        rating: {rating: r.rating, comment: r.comment}    
                    };
                    entry.tour.place_of_destination_name = await getPlace(db, r.place_of_destination_id);
                    const ratingId = uuidv4();
                    let rating = await instance.create('Rating', {
                        ratingId: ratingId,
                        rating: Number(entry.rating.rating), 
                        type: 'TOUR',
                        comment: entry.rating.comment,
                    });
                    entry.schedule.scheduleDateTime = entry.schedule.scheduleDateTime.toISOString().slice(0, 19)
                    entry.schedule.scheduleDateTime += '+00:00';
                    let schedule = await instance.batch([
                        {query: 'MATCH (s:Schedule {numberOfFreeSpots: $numberOfFreeSpots}) RETURN s;',
                        params: {
                            scheduleDateTime: entry.schedule.scheduleDateTime, 
                            numberOfFreeSpots: entry.schedule.numberOfFreeSpots
                        }}
                        
                    ]);
                    let finalSchedule = schedule[0].records.filter((r) => {
                        if (new Date(r._fields[0].properties.scheduleDateTime).getTime() == new Date(entry.schedule.scheduleDateTime).getTime()){// || new Date(r._fields[0].properties.scheduleDateTime) == new Date(entry.schedule.scheduleDateTime2)){
                            return r;
                        }
                    });
                    finalSchedule = finalSchedule[0]._fields[0];
                    console.log(finalSchedule.properties.scheduleId);
                    let customer = await instance.all('Customer', {
                        firstName: entry.customer.firstName, 
                        lastName: entry.customer.lastName, 
                        password: entry.customer.password, 
                        email: entry.customer.email,
                        phone: entry.customer.phone,
                    });
                    customer = customer._values[0];
                    //console.log('schedule', schedule);
                    const scheduleId = finalSchedule.properties.scheduleId;
                    const customerId = customer.get('customerId');
                    console.log(scheduleId, customerId, ratingId)
                    let relationship = await instance.batch([
                        {query: `MATCH (gr:Rating {ratingId: $ratingId}), (c:Customer {customerId: $customerId})
                        CREATE (c)-[r:WRITES]->(gr)
                        RETURN type(r);`,
                        params: {
                            customerId: customerId,
                            ratingId: ratingId,
                        }}
                    ]);
                    console.log(relationship);
                    let relationship2 = await instance.batch([
                        {query: `MATCH (gr:Rating {ratingId: $ratingId}), (s:Schedule {scheduleId: $scheduleId})
                        CREATE (gr)-[r:REFERS_TO]->(s)
                        RETURN type(r);`,
                        params: {
                            scheduleId: scheduleId,
                            ratingId: ratingId,
                        }}
                    ]);
                    console.log(relationship2)
                }
            } else {
                console.log('nope');
            } 
        });
        db.release();
    });
});

module.exports = {
    router,
  };