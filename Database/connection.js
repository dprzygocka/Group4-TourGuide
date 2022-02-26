require('dotenv').config();
const mysql = require('mysql');

const pool  = mysql.createPool({
  host     : process.env.HOST,
  database : process.env.DATABASE,
  user     : process.env.USER,
  password : process.env.PASSWORD,
  connectionLimit : 5,
});

module.exports = {
  pool,
};
