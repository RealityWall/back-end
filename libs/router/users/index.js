'use strict';

const usersApi = require('../../api/users');
const resetPassword = require('../../api/users/reset-password');
const usersAvatarApi = require('../../api/users/avatar');
const authentication = require('../../authentication');
const express = require('express');
const router  = express.Router();

router
    .get('/', authentication.isInRole(['user', 'admin']), usersApi.get)
    .post('/', usersApi.post)
    .post('/organization', authentication.isInRole(['admin']), usersApi.postOrganization)
    .post('/messenger', authentication.isInRole(['admin']), usersApi.postMessenger)
    .put('/', authentication.isInRole(['user', 'admin']), usersApi.put)
    .put('/password', authentication.isInRole(['user', 'admin']), usersApi.putPassword)
    .post('/avatar', authentication.isInRole(['user', 'admin']), usersAvatarApi.post)
    .delete('/avatar', authentication.isInRole(['user', 'admin']), usersAvatarApi.delete)
    .post('/verify/:token', usersApi.verify)
    .post('/forgot-password', usersApi.forgotPassword)
    .delete('/reset-password/:token', resetPassword.delete)
    .post('/reset-password/:token', resetPassword.post)
    .post('/facebook', usersApi.facebook)
    .post('/did-not-receive-mail', usersApi.didNotReceiveMail);

module.exports = router;