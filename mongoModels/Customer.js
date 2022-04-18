const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: {
        type:  String,
        required: true,
        maxLength: 60
    },
    lastName: {
        type:  String,
        required: true,
        maxLength: 60
    },
    password: {
        type:  String,
        required: true,
        maxLength: 100
    },
    email: {
        type:  String,
        required: true,
        maxLength: 127,
        unique: true
    },
    phone: {
        type:  String,
        required: true,
        maxLength: 20
    },
    bookings : [{
        _id: {
            type: ObjectId,
            required: true,
        },
        number_of_spots: {
            type: Number,
            required: true,
        },
        total_price: {
            type: mongoose.Decimal128,
            //set to 2 decimal values
            set: v => mongoose.Types.Decimal128.fromString(v.toFixed(2)),
        },
        booking_date_time: {
            type: Date,
            required: true,
        },
        schedule_id: {
            type: ObjectId,
            required: true,
        }
    }]
});

module.exports = mongoose.model("Customer", customerSchema);
