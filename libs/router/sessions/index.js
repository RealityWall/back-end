'use strict';

let sessionsApi = require('../../api/sessions');
let express = require('express');
let router  = express.Router();
let authentication = require('../../authentication');

router
    .post('/', sessionsApi.post)
    .delete('/', authentication.isInRole(['user', 'admin']), sessionsApi.delete);

module.exports = router;