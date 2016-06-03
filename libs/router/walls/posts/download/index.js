'use strict';

const wallsPostsDownloadApi = require('../../../../api/walls/posts/download');
const express = require('express');
const router  = express.Router({mergeParams: true});
const authentication = require('../../../../authentication');

router
    .get('/:pdfId', wallsPostsDownloadApi.get)
    .post('/', authentication.isInRole(['admin']), wallsPostsDownloadApi.post);

module.exports = router;