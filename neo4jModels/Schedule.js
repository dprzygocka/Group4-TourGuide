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
        required: true,
    },
    scheduleDateTime: {
        type: 'datetime',
        required: true,
    },
    assigned_to: {
        type: 'relationship',
        target: 'Tour',
        relationship: 'ASSIGNED_TO',
        direction: 'in',
        eager: true,
        'cascade': 'detach'
    },
    refers_to: {
        type: "relationship",
        relationship: "REFERS_TO",
        direction: "in",
        target: "Rating",
        eager: true,
        'cascade': 'delete' //delete the schedule node and related rating node
    },
    guides: {
        type: "relationship",
        relationship: "GUIDES",
        direction: "in",
        target: "Guide",
        eager: true,
        'cascade': 'detach'
    },
    books: {
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
        'cascade': 'detach'
    }
};
