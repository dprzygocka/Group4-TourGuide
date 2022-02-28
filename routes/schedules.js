const router = require('express').Router();
const { pool } = require('../database/connection');
const { Schedule } = require('../models/Schedule');

router.get('/api/mysql/schedules', (req, res) => {
    pool.getConnection((err, db) => {
        let query = 'SELECT schedule.*, guide.first_name, guide.last_name FROM schedule join guide on schedule.guide_id = guide.guide_id;';
        db.query(query, [], (error, result, fields) => {
            if (result && result.length) {
                const schedules = [];
                for (const schedule of result) {
                    console.log(schedule);
                    //create new object
                    schedules.push(new Schedule(schedule.schedule_id, schedule.no_free_spaces, schedule.date_time, schedule.tour_id, {guideId: schedule.guide_id, name: schedule.first_name, lastName: schedule.last_name} ));
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
        let query = 'SELECT schedule.*, guide.first_name, guide.last_name FROM schedule join guide on schedule.guide_id = guide.guide_id WHERE schedule_id = ?';
        db.query(query, [req.params.schedule_id], (error, result, fields) => {
            if (result && result.length) {
                console.log(result);
                res.send(new Schedule(result[0].schedule_id, result[0].no_free_spaces, result[0].date_time, result[0].tour_id, {guideId: result[0].guide_id, name: result[0].first_name, lastName: result[0].last_name}));
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
        db.query(query, [req.body.noFreeSpaces, req.body.dateTime, req.body.tour, req.body.guide], (error, result, fields) => {
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
        let query = 'DELETE * FROM schedule WHERE schedule_id = ?';
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