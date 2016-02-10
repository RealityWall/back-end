'use strict';

let wallsPostsApi = require('../../../api/walls/posts');
let express = require('express');
let router  = express.Router({mergeParams: true});
let authentication = require('../../../authentication');

router
    .get('/', authentication.isInRole(['admin']), wallsPostsApi.get)
    .post('/', authentication.isInRole(['user']), wallsPostsApi.post)
    .put('/:postId', authentication.isInRole(['admin']), wallsPostsApi.put);

module.exports = router;