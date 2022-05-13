const { instance } = require("../database/connection_neo4j");

module.exports = {
    scheduleId: {
        primary: true,
        type: 'uuid',
        required: true,
    },
    numberOfFreeSpots: {
        type: 'integer',
        min: 0
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
    }
};
