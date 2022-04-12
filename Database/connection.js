require('dotenv').config();
const mysql = require('mysql2');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD, {
    pool: {
      max: 5
    },
    host: process.env.HOST,
    dialect: 'mysql',
    define: {
      timestamps: false
    }
  }
)

const pool  = mysql.createPool({
  host     : process.env.HOST,
  database : process.env.DATABASE,
  user     : process.env.USER,
  password : process.env.PASSWORD,
  connectionLimit : 5,
});

module.exports = {
  pool, sequelize
};
