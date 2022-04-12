/*const { User } = require('./User');

class Customer extends User{
    constructor(id, firstName, lastName, email, phone, password) {
        super(id, firstName, lastName, email, phone);
        this.password = password;
    }
}*/

const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

class Customer extends Sequelize.Model {}
Customer.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: 'customer_id'
    },
    firstName:{ 
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
		type: DataTypes.STRING,
        allowNull: true,
	},
    phone: {
		type: DataTypes.STRING,
        allowNull: false,
	},
}, {
    sequelize: sequelize,
    tableName: 'customer',
    modelName: 'Customer',
})

module.exports = {
    Customer
};
  