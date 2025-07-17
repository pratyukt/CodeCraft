// db.js
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
module.exports = neon(process.env.DATABASE_URL);
