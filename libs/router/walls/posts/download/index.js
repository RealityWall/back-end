'use strict';

let wallsPostsDownloadApi = require('../../../../api/walls/posts/download');
let express = require('express');
let router  = express.Router({mergeParams: true});
let authentication = require('../../../../authentication');

router
    .get('/:pdfId', wallsPostsDownloadApi.get)
    .post('/', authentication.isInRole(['admin']), wallsPostsDownloadApi.post);

module.exports = router;