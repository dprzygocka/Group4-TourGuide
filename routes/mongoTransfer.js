const router = require('express').Router();
const { pool } = require('../database/connection');
const Tour = require('../mongoModels/Tour');

/*
router.get('/api/mysql/places/all', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT * FROM tourguide.place;';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const j = [];
                for (const r of result) {
                    console.log(r);
                    //create new object
                    j.push({ placeName: r.place_name });
                }
                console.log(j);
                res.send(j);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});
*/

router.get('/api/guides/all', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT guide.guide_id, guide.first_name, guide.last_name, guide.license, guide.email, guide.phone, guide.rating AS guide_rating, guide.contract_end_date FROM guide;';
        db.query(query, [], async (error, result, fields) => {
            if (result && result.length) {
                const j = [];
                for (const r of result) {
                    //create new object
                    let entry = { firstName: r.first_name, lastName: r.last_name, license: r.license, email: r.email, phone: r.phone, rating: r.guide_rating, contractEndDate: r.contract_end_date, guide_ratings: [] };
                    result = await getGuideRatings(db, r.guide_id);
                        if (result && result.length) {
                            entry.guide_ratings = result;
                            j.push(entry);
                        }
                    
                }
                res.send(j);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});

router.get('/api/tours/all', (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT tour.tour_id, tour.difficulty, tour.price, tour.duration, tour.number_of_spots, tour.age_limit, tour.distance, tour.rating AS tour_rating, tour.description, place.place_name AS place_of_departure_name, tour.place_of_destination_id, tour.is_active FROM tour join place on place.place_id = tour.place_of_departure_id;';
        db.query(query, [], async (error, result, fields) => {
            if (result && result.length) {
                const j = [];
                for (const r of result) {
                    let entry = { difficulty: r.difficulty, price: r.price, duration: r.duration, number_of_spots: r.number_of_spots, age_limit: r.age_limit, distance: r.distance, rating: r.tour_rating, description: r.description, place_of_departure_name: r.place_of_departure_name, place_of_destination_name: r.place_of_destination_name, is_active: r.is_active, tour_ratings: [] };
                    result = await getPlaceName(db, r.place_of_destination_id);
                    if (result && result.length) {
                        entry.place_of_destination_name = result;
                    }

                    result = await getTourRatings(db, r.tour_id);
                    if (result && result.length) {
                        entry.tour_ratings = result;
                        j.push(entry);
                    }
                    
                }
                res.send(j);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});

async function getPlaceName(db, placeId) {
    const result = await new Promise((resolve, reject) => db.query('SELECT place.place_name AS place_of_destination_name FROM place where place_id = ?;', placeId, (error, result, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }));
    return result[0].place_of_destination_name;
}

async function getGuideRatings(db, guide_id) {
    const ratings = [];
    const result = await new Promise((resolve, reject) => db.query('SELECT schedule.schedule_id, guide_rating.customer_id, guide_rating.rating, guide_rating.comment FROM guide_rating join schedule on schedule.schedule_id = guide_rating.schedule_id where schedule.guide_id = ?;', guide_id, (error, result, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }));
    for (const r of result) {
        //create new object
        ratings.push( {schedule_id: r.schedule_id, customer_id: r.customer_id, rating: r.rating, comment: r.comment} );
    } 
    return ratings;
}

async function getTourRatings(db, tour_id) {
    const ratings = [];
    const result = await new Promise((resolve, reject) => db.query('SELECT schedule.schedule_id, tour_rating.customer_id, tour_rating.rating, tour_rating.comment FROM tour_rating join schedule on schedule.schedule_id = tour_rating.schedule_id where schedule.tour_id = ?;', tour_id, (error, result, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }));
    for (const r of result) {
        //create new object
        ratings.push( {rating: r.rating, comment: r.comment, customer_id: r.customer_id, schedule_id: r.schedule_id} );
    } 
    return ratings;
}

async function getBookings(db, customerId) {
    const bookings = [];
    const result = await new Promise((resolve, reject) => db.query('SELECT booking.number_of_spots, booking.total_price, booking.booking_date_time, booking.schedule_id FROM booking where booking.customer_id = ?;', customerId, (error, result, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }));
    for (const r of result) {
        //create new object
        bookings.push({ number_of_spots: r.number_of_spots, total_price: r.total_price, booking_date_time: r.booking_date_time, schedule_id: r.schedule_id });
    } 
    return bookings;
}

router.get('/api/customers/all', (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT customer.customer_id, customer.first_name, customer.last_name, customer.password, customer.email, customer.phone FROM customer;';
        db.query(query, [], async (error, result, fields) => {
            if (result && result.length) {
                const j = [];
                for (const r of result) {
                    //create new object
                    let entry = { firstName: r.first_name, lastName: r.last_name, password: r.password, email: r.email, phone: r.phone, bookings: []};
                    result = await getBookings(db, r.customer_id);
                        if (result && result.length) {
                            entry.bookings = result;
                            j.push(entry);
                        }
                }
                res.send(j);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});

/*
router.get('/api/schedules/all', (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT schedule.schedule_date_time, guide.first_name, guide.last_name, guide.license, guide.email, guide.phone, guide.rating AS guide_rating, guide.contract_end_date, schedule.schedule_id, guide_rating.customer_id, guide_rating.rating, guide_rating.comment, tour.difficulty, tour.price, tour.duration, tour.number_of_spots, tour.age_limit, tour.distance, tour.rating AS tour_rating, tour.description, place.place_name AS place_of_departure_name, tour.place_of_destination_id, tour.is_active, tour_rating.schedule_id, tour_rating.customer_id, tour_rating.rating AS single_tour_rating, tour_rating.comment AS single_tour_comment FROM guide join schedule on guide.guide_id = schedule.guide_id join guide_rating on guide_rating.schedule_id = schedule.schedule_id join tour on tour.tour_id = schedule.tour_id join tour_rating on tour_rating.schedule_id = schedule.schedule_id join place on tour.place_of_departure_id = place.place_id;';
        db.query(query, [], async (error, result, fields) => {
            if (result && result.length) {
                const j = [];
                for (const r of result) {
                    //create new object
                    let entry = { schedule_datetime: r.schedule_date_time, guide: { firstName: r.first_name, lastName: r.last_name, license: r.license, email: r.email, phone: r.phone, rating: r.guide_rating, contractEndDate: r.contract_end_date, guide_ratings: {schedule_id: r.schedule_id, customer_id: r.customer_id, rating: r.rating, comment: r.comment} }, tour: { difficulty: r.difficulty, price: r.price, duration: r.duration, number_of_spots: r.number_of_spots, age_limit: r.age_limit, distance: r.distance, rating: r.tour_rating, description: r.description, place_of_departure_name: r.place_of_departure_name, place_of_destination_name: r.place_of_destination_name, is_active: r.is_active, tour_ratings: {rating: r.single_tour_rating, comment: r.single_tour_comment, customer_id: r.customer_id, schedule_id: r.schedule_id}  } };
                    result = await getPlaceName(db, r.place_of_destination_id);
                        if (result && result.length) {
                            entry.tour.place_of_destination_name = result;
                            j.push(entry);
                        }
                    
                }
                res.send(j);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});
*/

//without ratings
router.get('/api/schedules/all', (req, res) => {
    pool.getConnection(async (err, db) => {
        let query = 'SELECT schedule.schedule_date_time, guide.first_name, guide.last_name, guide.license, guide.email, guide.phone, guide.rating AS guide_rating, guide.contract_end_date, schedule.schedule_id, tour.difficulty, tour.price, tour.duration, tour.number_of_spots, tour.age_limit, tour.distance, tour.rating AS tour_rating, tour.description, place.place_name AS place_of_departure_name, tour.place_of_destination_id, tour.is_active FROM guide join schedule on guide.guide_id = schedule.guide_id join tour on tour.tour_id = schedule.tour_id join place on tour.place_of_departure_id = place.place_id;';
        db.query(query, [], async (error, result, fields) => {
            if (result && result.length) {
                const j = [];
                for (const r of result) {
                    //create new object
                    let entry = { schedule_datetime: r.schedule_date_time, guide: { firstName: r.first_name, lastName: r.last_name, license: r.license, email: r.email, phone: r.phone, rating: r.guide_rating, contractEndDate: r.contract_end_date, guide_ratings: [] }, tour: { difficulty: r.difficulty, price: r.price, duration: r.duration, number_of_spots: r.number_of_spots, age_limit: r.age_limit, distance: r.distance, rating: r.tour_rating, description: r.description, place_of_departure_name: r.place_of_departure_name, place_of_destination_name: r.place_of_destination_name, is_active: r.is_active, tour_ratings: []  } };
                    result = await getPlaceName(db, r.place_of_destination_id);
                        if (result && result.length) {
                            entry.tour.place_of_destination_name = result;
                            j.push(entry);
                        }
                    
                }
                res.send(j);
            } else {
                res.send({
                    message: 'Empty view.',
                });
            }
        });
        db.release();
    });
});
module.exports = {
    router,
  };