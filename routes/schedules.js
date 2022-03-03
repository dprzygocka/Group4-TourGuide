const router = require('express').Router();
const { pool } = require('../database/connection');
const { Schedule } = require('../models/Schedule');
const { Guide } = require('../models/Guide');
const { Tour } = require('../models/Tour');

router.get('/api/mysql/schedules', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id;';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const schedules = [];
                for (const schedule of result) {
                    console.log(schedule);
                    //create new object
                    schedules.push(new Schedule(schedule.schedule_id, schedule.no_free_spaces, schedule.schedule_date_time, new Tour(schedule.tour_id,'', schedule.duration, '', schedule.difficulty, '', '', '', schedule.description, '', schedule.place_name), new Guide(schedule.guide_id, schedule.first_name, schedule.last_name)));
                }
                res.send(schedules);
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.get('/api/mysql/schedules/:schedule_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT schedule.*, guide.first_name, guide.last_name, tour.difficulty, tour.duration, tour.description, place.place_name FROM schedule join guide on schedule.guide_id = guide.guide_id join tour on schedule.tour_id = tour.tour_id join place on tour.place_of_destination_id = place.place_id;';
        db.query(query, [req.params.schedule_id], (error, result, fields) => {
            if (result && result.length) {
                console.log(result);
                res.send(new Schedule(result[0].schedule_id, result[0].no_free_spaces, result[0].schedule_date_time, new Tour(result[0].tour_id,'', result[0].duration, '', result[0].difficulty, '', '', '', result[0].description, '', result[0].place_name), new Guide(result[0].guide_id, result[0].first_name, result[0].last_name)));
            } else {
                res.send({
                    message: 'No results',
                });
            }
        });
        db.release();
    });
});

router.post('/api/mysql/schedules', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'INSERT INTO schedule (no_free_spaces, date_time, tour_id, guide_id) VALUES (?, ?, ?, ?)';
        db.query(query, [req.body.noFreeSpaces, req.body.dateTime, req.body.tourId, req.body.guideId], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Schedule successfully added.',
                });
            } else {
                res.send({
                    message: 'Something went wrong',
                });
            }
        });
        db.release();
    });
});


router.delete('/api/mysql/schedules/:schedule_id', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'DELETE FROM schedule WHERE schedule_id = ?;';
        db.query(query, [req.params.schedule_id], (error, result, fields) => {
            if (result && result.affectedRows === 1) {
                res.send({
                    message: 'Schedule successfully deleted.',
                });
            } else {
                res.send({
                    message: 'Something went wrong',
                });
            }
        });
        db.release();
    });
});

module.exports = {
    router,
  };