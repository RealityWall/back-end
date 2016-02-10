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

    var client = require('redis').createClient();
    var limiter = require('express-limiter')(app, client);
    // limit 3600 requests / hour
    limiter({
        path: '*',
        method: 'all',
        lookup: ['connection.remoteAddress'],
        total: 3600,
        expire: 1000 * 60 * 60,
        onRateLimited: function (req, res) {
            res.status(429).json({ message: 'Rate limit exceeded'});
        }
    });

    let router = require('./libs/router');
    app.use('/api', router);

    app.use('/images', express.static('./uploads'));

    var models = require("./libs/models");
    models.sequelize.sync({force: true}).then(function () {
        let server = app.listen(3000, function() {
            cb(server);
        });
    });
};