'use strict';

const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res, next) => {
  const { fullname, username, password } = req.body;

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };

      const requiredFields = ['username'];

      const missingField = requiredFields.find(field => !(field in req.body));

      if (missingField) {
        const err = new Error(`Missing '${missingField}' in request body`);
        err.status = 422;
        return next(err);
      }

      const stringFields = ['fullname', 'username', 'password'];
      const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

      if (nonStringField) {
        const err = new Error(`'${nonStringField}': Incorrect field type: expected string`);
        err.status = 422;
        next(err);
      }

      const explicityTrimmedFields = ['username', 'password'];
      const nonTrimmedField = explicityTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

      if (nonTrimmedField) {
        const err = new Error(`'${nonTrimmedField}' cannot start or end with whitespace`);
        err.status = 422;
        next(err);
      }

      const sizedFields = {
        username: {
          min: 1
        },
        password: {
          min: 8,
          max: 72
        }
      };

      const tooSmallField = Object.keys(sizedFields).find(field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min);

      const tooLargeField = Object.keys(sizedFields).find(field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max);

      if (tooSmallField) {
        const err = new Error(`'${tooSmallField}' must be at least ${sizedFields[tooSmallField]
          .min} characters long`);
        err.status = 422;
        next(err);
      }

      if (tooLargeField) {
        const err = new Error(`'${tooLargeField}' must be at most ${sizedFields[tooLargeField]
          .max} characters long`);
        err.status = 422;
        next(err);
      }

      return User.create(newUser);
    })
    .then(result => {
      return res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });

});


module.exports = router;