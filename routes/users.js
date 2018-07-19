'use strict';

const express = require('express');
const { getUsersHandler } = require('../handlers/user.handlers');
const router = express.Router();

router.post('/', getUsersHandler);

module.exports = router;