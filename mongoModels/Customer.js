const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 60
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 60
    },
    password: {
        type: String,
        required: true,
        maxLength: 100
    },
    email: {
        type: String,
        required: true,
        maxLength: 127,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        maxLength: 20
    },
});

module.exports = mongoose.model("Customer", customerSchema);
