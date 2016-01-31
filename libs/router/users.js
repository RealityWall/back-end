'use strict';

let usersCallback = require('../api/users');
let resetPassword = require('../api/users/reset-password.js');
let express = require('express');
let router  = express.Router();

router
    .post('/', usersCallback.post)
    .post('/verify/:token', usersCallback.verify)
    .post('/forgot-password', usersCallback.forgotPassword)
    .delete('/reset-password/:token', resetPassword.delete)
    .post('/reset-password/:token', resetPassword.post);

module.exports = router;