const { instance } = require("../database/connection_neo4j");

module.exports = {
    customerId: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    firstName: {
        type: 'string',
        unique: 'false',
        required: 'true',
        max: 60,
    },
    lastName: {
        type: 'string',
        unique: 'false',
        required: 'true',
        max: 60,
    },
    email: {
        type: 'string',
        unique: 'false',
        required: 'true',
        max: 127,
    },
    phone: {
        type: 'string',
        unique: 'false',
        required: 'true',
    },
    password: {
        type: 'string', //should be hash
        unique: 'false',
        required: 'true',
        max: 100,
    },
    rating: {
        type: "relationship",
        relationship: "WRITES",
        direction: "out",
        target: "Rating",
        eager: false,
    },
    booking: {
        type: "relationship",
        relationship: "BOOKS",
        direction: "out",
        target: "Schedule",
        eager: true,
        properties: {
            bookingId: {
                primary: true,
                type: 'uuid',
                required: true,
            },
            totalPrice: {
                type: 'number',
                precision: 2,
                min: 0,
                max: 999999.99,
                required: false,
            },
            bookingDateTime: {
                type: 'datetime',
                required: true,
            },
            numberOfSpots: {
                type: 'integer',
                min: 0,
                required: true,
            },
        },
    }
};
