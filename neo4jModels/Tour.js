const { instance } = require("../database/connection_neo4j");

module.exports = {
    tourId: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    price: {
        type: 'number',
        precision: 2,
        min: 0,
        max: 9999.99,
        required: true,
    },
    duration: {
        type: 'number',
        precision: 1,
        min: 0,
        max: 99.9,
        required: true,
    },
    numberOfSpots: {
        type: 'integer',
        min: 0,
        required: true,
    },
    ageLimit: {
        type: 'integer',
        min: 0,
        required: true,
    },
    distance: {
        type: 'number',
        precision: 1,
        min: 0,
        max: 999.99,
        required: true,
    },
    rating: {
        type: 'number',
        precision: 2,
        min: 0,
        max: 5,
        required: false
    },
    description: {
        type: 'string',
        required: true,
        max: 510
    },
    isActive: {
        type: 'boolean',
        required: true,
    },
    difficulty: {
        type: 'string',
        valid: ['EASY', 'MEDIUM', 'HARD', 'EXTREME'],
        required: true,
    },
    starts_in: {
        type: 'relationship',
        target: 'Place',
        relationship: 'STARTS_IN',
        direction: 'out',
        //automatically include in find all
        eager: true,
    },
    leads_to: {
        type: 'relationship',
        target: 'Place',
        relationship: 'LEADS_TO',
        direction: 'out',
        //automatically include in find all
        eager: true,
    },
    schedule: {
        type: 'relationship',
        target: 'Schedule',
        relationship: 'ASSIGNED_TO',
        direction: 'out',
    }
};
