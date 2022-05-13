const { instance } = require("../database/connection_neo4j");

module.exports = {
    guideId: {
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
    license: {
        type: 'string',
        unique: 'false',
        required: 'true',
        max: 45,
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
    rating: {
        type: 'number',
        precision: 2,
        min: 0,
        max: 5,
        unique: 'false',
        required: 'false',
    },
    contractEndDate: {
        type: 'date',
        unique: 'false',
        required: 'true',
    },
    schedule: {
        type: "relationship",
        relationship: "GUIDES",
        direction: "out",
        target: "Schedule",
        eager: false,
    }
};
