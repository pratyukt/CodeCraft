// authUtils.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secret = process.env.JWT_SECRET;

exports.hash = (pwd) => bcrypt.hash(pwd, 10);
exports.compare = bcrypt.compare;
exports.sign = (payload) => jwt.sign(payload, secret, { expiresIn: '15m' });
exports.verify = (token) => jwt.verify(token, secret);
