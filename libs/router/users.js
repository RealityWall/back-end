'use strict';

let usersApi = require('../api/users');
let resetPassword = require('../api/users/reset-password.js');
let usersAvatarApi = require('../api/users/avatar.js');
let authentication = require('../authentication');
let express = require('express');
let router  = express.Router();

router
    .post('/', usersApi.post)
    .put('/', authentication.isInRole(['user', 'admin']), usersApi.put)
    .put('/password', authentication.isInRole(['user', 'admin']), usersApi.putPassword)
    .post('/avatar', authentication.isInRole(['user', 'admin']), usersAvatarApi.post)
    .delete('/avatar', authentication.isInRole(['user', 'admin']), usersAvatarApi.delete)
    .post('/verify/:token', usersApi.verify)
    .post('/forgot-password', usersApi.forgotPassword)
    .delete('/reset-password/:token', resetPassword.delete)
    .post('/reset-password/:token', resetPassword.post)
    .post('/facebook', usersApi.facebook);

module.exports = router;