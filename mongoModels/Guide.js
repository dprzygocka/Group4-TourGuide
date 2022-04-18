const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
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
    license: {
        type: String,
        required: true,
        maxLength: 45
    },
    email: {
        type: String,
        required: true,
        maxLength: 127
    },
    phone: {
        type: String,
        required: true,
        maxLength: 20
    },
    rating: {
        type: Number,
        required: false
    },
    contractEndDate: {
		type: Date,
        required: true
	},
    guide_ratings: [
        {
            schedule_id: {
                type: Number,
                required: true
            },
            customer_id: {
                type: Number,
                default: null
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: Number,
                required: false,
                default: null
            }
        }
    ],
});

module.exports = mongoose.model("Guide", guideSchema);
