const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const  PORT = process.env.PORT || 5000;

module.exports = pool;
