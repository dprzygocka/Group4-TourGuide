const { instance } = require("../database/connection_neo4j");

module.exports = {
    ratingId: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    rating: {
        type: 'number',
        precision: 2,
        min: 0,
        max: 5,
        unique: 'false',
        required: 'true',
    },
    comment: {
        type: 'string',
        unique: 'false',
        required: 'false',
        max: 510,
    },
    schedule: {
        type: "relationship",
        relationship: "REFERS_TO",
        direction: "out",
        target: "Schedule",
        eager: true
    },
    schedule: {
        type: "relationship",
        relationship: "WRITES",
        direction: "in",
        target: "Customer",
        eager: true
    }
};
