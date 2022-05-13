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
    tourPlaceOfDeparture: {
        required: false,
        type: 'relationship',
        target: 'Tour',
        relationship: 'STARTS_IN',
        direction: 'in',
    },
    tourPlaceOfDestination: {
        required: false,
        type: 'relationship',
        target: 'Tour',
        relationship: 'LEADS_TO',
        direction: 'in',
    },
};
