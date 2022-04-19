const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    placeName: {
        type: String,
        required: true,
        maxLength: 120,
        unique: true
    }
});

module.exports = mongoose.model("Place", placeSchema);
