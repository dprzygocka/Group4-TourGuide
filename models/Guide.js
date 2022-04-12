const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

class Guide extends Sequelize.Model {}
Guide.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: 'guide_id'
    },
    firstName:{ 
        type: DataTypes.STRING(60),
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(60),
        allowNull: false,
        field: 'last_name'
    },
    license: {
		type: DataTypes.STRING(45),
        allowNull: false,
	},
    email: {
        type: DataTypes.STRING(127),
        allowNull: false,
    },
    phone: {
		type: DataTypes.STRING(20),
        allowNull: false,
	},
    rating: {
		type: DataTypes.DECIMAL(3,2),
        allowNull: true,
	},
    contractEndDate: {
		type: DataTypes.DATE,
        allowNull: false,
        field: 'contract_end_date'
	},
}, {
    sequelize: sequelize, 
    tableName: 'guide',
    modelName: 'Guide',
})

module.exports = {
    Guide
};
  