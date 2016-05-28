'use strict';

let express = require('express');
let router  = express.Router();
let usersRouter = require('./users');
let sessionsRouter = require('./sessions');
let wallsRouter = require('./walls');
let postsRouter = require('./posts');

router
    .use('/users', usersRouter)
    .use('/sessions', sessionsRouter)
    .use('/posts', postsRouter)
    .use('/walls', wallsRouter);

module.exports = router;