const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

class Tour extends Sequelize.Model {}
Tour.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: 'tour_id'
    },
    price:{ 
        type: DataTypes.DECIMAL(3,1),
        allowNull: false,
    },
    duration: {
        type: DataTypes.DECIMAL(3,1),
        allowNull: false,
    },
    numberOfSpots: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'number_of_spots'
    },
    difficulty: {
		type: DataTypes.ENUM("EASY", "MEDIUM", "HARD", "EXTREME"),
        allowNull: false,
	},
    ageLimit: {
		type: DataTypes.INTEGER,
        allowNull: false,
        field: 'age_limit'
	},
    placeOfDeparture: {
		type: DataTypes.INTEGER,
        allowNull: true,
        field: 'place_of_departure_id',
        references: {
            model: 'place',
            key: 'place_id'
        }
	},
    distance: {
		type: DataTypes.DECIMAL(4,1),
        allowNull: false,
	},
    description: {
		type: DataTypes.TEXT(510),
        allowNull: false,
	},
    rating: {
		type: DataTypes.DECIMAL(3,2),
        allowNull: true,
	},
    placeOfDestinagion: {
		type: DataTypes.INTEGER,
        allowNull: true,
        field: 'place_of_destination_id',
        references: {
            model: 'place',
            key: 'place_id'
        }
	},
    isActive: {
		type: DataTypes.BOOLEAN,
        allowNull: true,
        default: 1,
        field: 'is_active'
	},
}, {
    sequelize: sequelize,
    tableName: 'tour',
    modelName: 'Tour',
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    },
       timestamps: false 
})


module.exports = {Tour};