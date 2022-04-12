const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

class Place extends Sequelize.Model {}
Place.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: 'place_id'
    },
    placeName:{ 
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        field: 'place_name'
    }
}, {
    sequelize: sequelize, 
    tableName: 'place',
    modelName: 'Place',
})

module.exports = { Place };