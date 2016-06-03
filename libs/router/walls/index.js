'use strict';

const wallsApi = require('../../api/walls');
const wallsPicturesApi = require('../../api/walls/pictures');
const express = require('express');
const router  = express.Router();
const authentication = require('../../authentication');
const wallsPostsRouter = require('./posts');

router
    .get('/', wallsApi.get)
    .get('/:wallId', wallsApi.getById)
    .delete('/:wallId', authentication.isInRole(['admin']), wallsApi.deleteById)
    .put('/:wallId', authentication.isInRole(['admin']), wallsApi.putById)
    .post('/', authentication.isInRole(['admin']), wallsApi.post)
    .post('/:wallId/pictures', authentication.isInRole(['admin', 'messenger']), wallsPicturesApi.post);

router.use('/:wallId/posts', wallsPostsRouter);

module.exports = router;