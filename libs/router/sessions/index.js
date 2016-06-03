'use strict';

const sessionsApi = require('../../api/sessions');
const express = require('express');
const router  = express.Router();
const authentication = require('../../authentication');

router
    .post('/', sessionsApi.post)
    .delete('/', authentication.isInRole(['user', 'admin']), sessionsApi.delete);

module.exports = router;