'use strict';

const postsApi = require('../../api/posts');
const express = require('express');
const router  = express.Router();
const authentication = require('../../authentication');

router
    .get('/', postsApi.get)
    .get('/download/:pdfId', postsApi.getDownload)
    .post('/download', authentication.isInRole(['admin', 'messenger']), postsApi.postDownload);

module.exports = router;