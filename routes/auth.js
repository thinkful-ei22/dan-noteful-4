'use strict';

const express = require('express');
const router = express.Router();

const passport = require('passport');
const options = { session: false, failWithError: true };
const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

const { tokenGenerationHandler } = require('../handlers/auth.handlers');

router.post('/login', localAuth, tokenGenerationHandler);

router.post('/refresh', jwtAuth, tokenGenerationHandler);

module.exports = router;