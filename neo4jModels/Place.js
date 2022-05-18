const { instance } = require("../database/connection_neo4j");

module.exports = {
    placeId: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    placeName: {
        type: 'string',
        unique: 'true',
    },
    starts_in: {
        required: false,
        type: 'relationship',
        target: 'Tour',
        relationship: 'STARTS_IN',
        direction: 'in',
        eager: false,
    },
    leads_to: {
        required: false,
        type: 'relationship',
        target: 'Tour',
        relationship: 'LEADS_TO',
        direction: 'in',
        eager: false,
    },
};
