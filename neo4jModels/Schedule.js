const { instance } = require("../database/connection_neo4j");

module.exports = {
    scheduleId: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    numberOfFreeSpots: {
        type: 'integer',
        min: 0,
    },
    scheduleDateTime: {
        type: 'datetime',
        required: true,
    },
    tour: {
        type: 'relationship',
        target: 'Tour',
        relationship: 'ASSIGNED_TO',
        direction: 'in',
        eager: true,
    },
    refers_to: {
        type: "relationship",
        relationship: "REFERS_TO",
        direction: "in",
        target: "Rating",
        eager: true,
    },
    guides: {
        type: "relationship",
        relationship: "GUIDES",
        direction: "in",
        target: "Guide",
        eager: true,
    },
    customerBooking: {
        type: "relationship",
        relationship: "BOOKS",
        direction: "in",
        target: "Customer",
        eager: false,
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
