'use strict';

let express = require('express');
let router  = express.Router();
let usersRouter = require('./users');
let sessionsRouter = require('./sessions');
let wallsRouter = require('./walls');

router
    .use('/users', usersRouter)
    .use('/sessions', sessionsRouter)
    .use('/walls', wallsRouter);

module.exports = router;