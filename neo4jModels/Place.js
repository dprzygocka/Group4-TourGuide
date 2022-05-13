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
    }
};
