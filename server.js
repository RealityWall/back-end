'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const router = require('./libs/router');
const models = require("./libs/models");

module.exports = (cb) => {

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(expressValidator());
    app.use('/api', router);
    app.use('/images', express.static('./uploads'));

    models.sequelize.sync({/*force: process.env.NODE_ENV !== 'production'*/}).then(() => {
        const server = app.listen(3000, () => {
            cb(server);
        });
    });

};