const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

class Place extends Sequelize.Model {}
Place.init({
}, {
    sequelize: pool, 
    modelName: 'Place'
})


module.exports = {Place};