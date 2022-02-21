require('dotenv').config();
const mysql = require('mysql');

const pool  = mysql.createPool(
  process.env.CLEARDB_DATABASE_URL, {
  connectionLimit : 5,
});

module.exports = {
  pool,
};
