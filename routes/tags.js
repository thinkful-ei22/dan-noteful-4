'use strict';

const express = require('express');
const passport = require('passport');
const { 
  getTagsHandler, 
  getTagByIdHandler, 
  createTagHandler, 
  updateTagHandler, 
  deleteTagHandler } = require('../handlers/tag.handlers');

const router = express.Router();
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.route('/')
  .get(getTagsHandler)
  .post(createTagHandler);

router.route('/:id')
  .get(getTagByIdHandler)
  .put(updateTagHandler)
  .delete(deleteTagHandler);

module.exports = router;