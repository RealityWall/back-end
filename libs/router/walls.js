'use strict';

let wallsApi = require('../api/walls');
let express = require('express');
let router  = express.Router();
let authentication = require('../authentication');

router
    .get('/', wallsApi.get)
    .get('/:id', wallsApi.getById)
    .delete('/:id', authentication.isInRole(['admin']), wallsApi.deleteById)
    .put('/:id', authentication.isInRole(['admin']), wallsApi.putById)
    .post('/', authentication.isInRole(['admin']), wallsApi.post);

module.exports = router;