const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    difficulty: {
        type: mongoose.String,
        enum: ['EASY', 'MEDIUM', 'HARD', 'EXTREME'],
        required: true,
    },
    price: {
        type: mongoose.Decimal128,
        //set to 2 decimal values
        set: v => mongoose.Types.Decimal128.fromString(v.toFixed(2)),
        required: true,
    },
    duration: {
        type: mongoose.Decimal128,
        //set to 1 decimal value
        set: v => mongoose.Types.Decimal128.fromString(v.toFixed(1)),
        required: true,
    },
    number_of_spots: {
        type: mongoose.Number,
        required: true,
    },
    age_limit: {
        type: mongoose.Number,
        required: true,
    },
    distance: {
        type: mongoose.Decimal128,
        //set to 1 decimal value
        set: v => mongoose.Types.Decimal128.fromString(v.toFixed(1)),
        required: true,
    },
    rating: {
        type: mongoose.Decimal128,
        //set to 2 decimal values
        set: v => mongoose.Types.Decimal128.fromString(v.toFixed(2)),
        required: true,
    },
    description: {//nvarchar 510
        type: mongoose.String,
        required: true,
        maxLength: 510
    },
    place_of_departure_name: {//varchar
        type: mongoose.String,
        required: true,
        maxLength: 120
    },
    place_of_destination_name: {//int
        type: mongoose.String,
        required: true,
        maxLength: 120
    },
    is_active: {//boolean
        type: mongoose.Boolean,
        required: true,
        maxLength: 20
    },
});

module.exports = mongoose.model("Tour", tourSchema);
