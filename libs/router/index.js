'use strict';

const express = require('express');
const router  = express.Router();
const usersRouter = require('./users');
const sessionsRouter = require('./sessions');
const postsRouter = require('./posts');

router
    .use('/users', usersRouter)
    .use('/sessions', sessionsRouter)
    .use('/posts', postsRouter);

module.exports = router;