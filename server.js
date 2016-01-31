'use strict';

module.exports = function buildServer(cb) {
    let express = require('express');
    let app = express();
    let cors = require('cors');
    app.use(cors());

    let bodyParser = require('body-parser');
    app.use(bodyParser.json());
    let expressValidator = require('express-validator');
    app.use(expressValidator());

    let router = require('./libs/router');
    app.use('/api', router);


    var models = require("./libs/models");
    var server = null;
    models.sequelize.sync({force: true}).then(function () {
        server = app.listen(3000, function() {
            cb(server);
        });
    });
};