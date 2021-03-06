'use strict';

const mongoose = require('mongoose');
const Folder = require('../models/folder');
const Note = require('../models/note');
const Tag = require('../models/tag');

function validateNoteId(id) {
  return Note.count({ _id: id })
    .then(count => {
      if (count === 0) {
        const err = new Error('The `noteId` doesn\'t exist');
        err.status = 404;
        return Promise.reject(err);
      }
    });
}

function validateFolderId(folderId, userId) {
  if (folderId === '' || folderId === null || folderId === undefined) {
    return Promise.resolve();
  }
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return Promise.reject(err);
  }
  return Folder.count({ _id: folderId, userId })
    .then(count => {
      if (count === 0) {
        const err = new Error('The `folderId is not valid`');
        err.status = 400;
        return Promise.reject(err);
      }
    });
}

function validateTagIds(tags, userId) {
  if (tags === undefined) {
    return Promise.resolve();
  }
  if (!Array.isArray(tags)) {
    const err = new Error('The `tags` must be an array');
    err.status = 400;
    return Promise.reject(err);
  }
  return Tag.find({ $and: [{ _id: { $in: tags }, userId }] })
    .then(results => {
      if (tags.length !== results.length) {
        const err = new Error('The `tags` array contains and invalid id');
        err.status = 400;
        return Promise.reject(err);
      }
    });
}

exports.getNotesHandler = (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  const userId = req.user.id;

  let filter = { userId };

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
};

exports.getNoteByIdHandler = (req, res, next) => {
  const { id } = req.params;

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
};

exports.createNoteHandler = (req, res, next) => {
  const { title, content, folderId, tags = [] } = req.body;

  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    tags.forEach((tag) => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The tags `id` is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }

  const newNote = { title, content, tags, userId };

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    newNote.folderId = folderId;
  }

  Promise.all([validateFolderId(folderId, userId), validateTagIds(tags, userId)])
    .then(() => Note.create(newNote))
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
};

exports.updateNoteHandler = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, content, folderId, tags = [] } = req.body;

  /***** Never trust users - validate input *****/

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = new Error('The tags `id` is not valid');
      err.status = 400;
      return next(err);
    }
  }

  const updateNote = { title, content, tags, userId };

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    updateNote.folderId = folderId;
  }

  Promise.all([validateFolderId(folderId, userId), validateTagIds(tags, userId), validateNoteId(id, userId)])
    .then(() => Note.findOneAndUpdate({ _id: id, userId }, updateNote, { new: true }))
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(200)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteNoteHandler = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};