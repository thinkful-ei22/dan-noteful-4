'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config.js');

function createAuthToken(user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

exports.tokenGenerationHandler = function (req, res) {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
};