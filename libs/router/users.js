'use strict';

let usersCallback = require('../api/users');
let resetPassword = require('../api/users/reset-password.js');
var authentication = require('../authentication');
let express = require('express');
let router  = express.Router();

router
    .post('/', usersCallback.post)
    .put('/', authentication.isInRole(['user', 'admin']), usersCallback.put)
    .put('/password', authentication.isInRole(['user', 'admin']), usersCallback.putPassword)
    .post('/avatar', authentication.isInRole(['user', 'admin']), usersCallback.postAvatar)
    .post('/verify/:token', usersCallback.verify)
    .post('/forgot-password', usersCallback.forgotPassword)
    .delete('/reset-password/:token', resetPassword.delete)
    .post('/reset-password/:token', resetPassword.post);

module.exports = router;