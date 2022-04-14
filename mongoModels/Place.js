const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    placeName: String
});

module.exports = mongoose.model("Place", placeSchema);
