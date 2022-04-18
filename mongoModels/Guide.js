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
        type: mongoose.Decimal128,
        //set to 1 decimal value
        set: v => mongoose.Types.Decimal128.fromString(v.toFixed(1)),
        required: false
    },
    contractEndDate: {
		type: Date,
        required: true
	},
    guide_ratings: [
        {
            schedule_id: {
                type: mongoose.ObjectId,
                required: true
            },
            customer_id: {
                type: mongoose.ObjectId,
                required: true
            },
            rating: {
                type: mongoose.Decimal128,
                //set to 1 decimal value
                 set: v => mongoose.Types.Decimal128.fromString(v.toFixed(1)),
                required: true
            },
            comment: {
                type: String,
                required: true,
                maxLength: 510
            }
        }
    ],
});

module.exports = mongoose.model("Guide", guideSchema);
