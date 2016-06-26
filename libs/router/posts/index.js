'use strict';

const postsApi = require('../../api/posts');
const express = require('express');
const router  = express.Router();
const authentication = require('../../authentication');

router
    .post('/', authentication.isInRole(['user']), postsApi.post);

module.exports = router;