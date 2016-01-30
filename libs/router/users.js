'use strict';

let usersCallback = require('../api/users');
let express = require('express');
let router  = express.Router();

router
    .post('/', usersCallback.post);

module.exports = router;