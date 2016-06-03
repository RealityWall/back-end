'use strict';

const postsApi = require('../../api/posts');
const express = require('express');
const router  = express.Router();

router
    .get('/', postsApi.get);

module.exports = router;