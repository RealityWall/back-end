'use strict';

let postsApi = require('../../api/posts');
let express = require('express');
let router  = express.Router();

router
    .get('/', postsApi.get);

module.exports = router;