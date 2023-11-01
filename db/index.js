const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.STACKHERO_MYSQL_HOST,
  user: process.env.STACKHERO_MYSQL_USER,
  password: process.env.STACKHERO_MYSQL_ROOT_PASSWORD,
  database: process.env.STACKHERO_MYSQL_DATABASE,
  port: process.env.STACKHERO_MYSQL_PORT
});

module.exports = pool;
