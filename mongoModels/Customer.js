const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: mongoose.String,
        required: true,
        maxLength: 60
    },
    lastName: {
        type: mongoose.String,
        required: true,
        maxLength: 60
    },
    password: {
        type: mongoose.String,
        required: true,
        maxLength: 100
    },
    email: {
        type: mongoose.String,
        required: true,
        maxLength: 127,
        unique: true
    },
    phone: {
        type: mongoose.String,
        required: true,
        maxLength: 20
    },
});

module.exports = mongoose.model("Customer", customerSchema);
