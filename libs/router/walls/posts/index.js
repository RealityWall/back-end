'use strict';

const wallsPostsApi = require('../../../api/walls/posts');
const express = require('express');
const router  = express.Router({mergeParams: true});
const authentication = require('../../../authentication');
const downloadRouter = require('./download');

router
    .get('/', authentication.isInRole(['admin']), wallsPostsApi.get)
    .post('/', authentication.isInRole(['user', 'organization']), wallsPostsApi.post)
    .put('/:postId', authentication.isInRole(['admin']), wallsPostsApi.put);

router.use('/download', downloadRouter);


module.exports = router;