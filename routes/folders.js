'use strict';

const express = require('express');
const passport = require('passport');

const { 
  getFoldersHandler, 
  getFolderByIdHandler, 
  createFolderHandler, 
  updateFolderHandler, 
  deleteFolderHandler } = require('../handlers/folder.handlers');

const router = express.Router();
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

router.route('/')
  .get(getFoldersHandler)
  .post(createFolderHandler);

router.route('/:id')
  .get(getFolderByIdHandler)
  .put(updateFolderHandler)
  .delete(deleteFolderHandler);

module.exports = router;
