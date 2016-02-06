'use strict';

let wallsApi = require('../api/walls');
let express = require('express');
let router  = express.Router();
let authentication = require('../authentication');

router
    .get('/', wallsApi.get)
    .post('/', authentication.isInRole(['admin']), wallsApi.post);

module.exports = router;