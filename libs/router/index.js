'use strict';

let express = require('express');
let router  = express.Router();
let usersRouter = require('./users');

router
    .use('/users', usersRouter);

module.exports = router;