const mongoose = require('mongoose');
const {GuideSchema} = require('./Guide.js');
const {TourSchema} = require('./Tour.js');

const scheduleSchema = new mongoose.Schema({
    schedule_datetime: {
        type: mongoose.Date,
        required: true,
    },
    guide: {
        type: GuideSchema,
        required: true,
    },
    tour: {
        type: TourSchema,
        required: true,
    },
});

module.exports = mongoose.model("Schedule", scheduleSchema);