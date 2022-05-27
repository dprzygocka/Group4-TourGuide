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
    type: {
        type: 'string',
        valid: ['GUIDE', 'TOUR'],
        required: true,
    },
    comment: {
        type: 'string',
        unique: 'false',
        required: 'false',
        max: 510,
    },
    refers_to: {
        type: "relationship",
        relationship: "REFERS_TO",
        direction: "out",
        target: "Schedule",
        eager: true,
        'cascade': 'detach'
    },
    writes: {
        type: "relationship",
        relationship: "WRITES",
        direction: "in",
        target: "Customer",
        eager: true,
        'cascade': 'detach'
    }
};
