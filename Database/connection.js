require('dotenv').config();
const mysql = require('mysql2');
const { Sequelize } = require('sequelize');

const pool = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD, {
    pool: {
      max: 5
    },
    host: process.env.HOST,
    dialect: 'mysql'
  }
)

module.exports = {
  pool,
};
