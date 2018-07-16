'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res, next) => {
  const { fullname, username, password } = req.body;
  const newUser = { fullname, username, password };

  const requiredFields = ['username'];

  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  User.create(newUser)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    });

});


module.exports = router;