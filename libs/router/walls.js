'use strict';

let wallsApi = require('../api/walls');
let wallsPicturesApi = require('../api/walls/pictures.js');
let express = require('express');
let router  = express.Router();
let authentication = require('../authentication');

router
    .get('/', wallsApi.get)
    .get('/:id', wallsApi.getById)
    .delete('/:id', authentication.isInRole(['admin']), wallsApi.deleteById)
    .put('/:id', authentication.isInRole(['admin']), wallsApi.putById)
    .post('/', authentication.isInRole(['admin']), wallsApi.post)
    .post('/:id/pictures', authentication.isInRole(['admin']), wallsPicturesApi.post);

module.exports = router;