'use strict';

let wallsApi = require('../../api/walls');
let wallsPicturesApi = require('../../api/walls/pictures');
let express = require('express');
let router  = express.Router();
let authentication = require('../../authentication');
let wallsPostsRouter = require('./posts');

router
    .get('/', wallsApi.get)
    .get('/:wallId', wallsApi.getById)
    .delete('/:wallId', authentication.isInRole(['admin']), wallsApi.deleteById)
    .put('/:wallId', authentication.isInRole(['admin']), wallsApi.putById)
    .post('/', authentication.isInRole(['admin']), wallsApi.post)
    .post('/:wallId/pictures', authentication.isInRole(['admin']), wallsPicturesApi.post);

router.use('/:wallId/posts', wallsPostsRouter);

module.exports = router;