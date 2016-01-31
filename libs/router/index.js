'use strict';

let express = require('express');
let router  = express.Router();
let usersRouter = require('./users');
let sessionsRouter = require('./sessions');

router
    .use('/users', usersRouter)
    .use('/sessions', sessionsRouter);

module.exports = router;