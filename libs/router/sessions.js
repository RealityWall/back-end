'use strict';

let sessionsCallback = require('../api/sessions');
let express = require('express');
let router  = express.Router();

router
    .post('/', sessionsCallback.post);

module.exports = router;