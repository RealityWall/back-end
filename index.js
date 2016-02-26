'use strict';

let db = require('./libs/models');

let buildServer = require('./server.js');
buildServer( (server) => {
    db
        .initialize()
        .then(() => {
            console.log('Express server listening on port ' + server.address().port);
        })
        .catch(() => {
            server.close();
        });
});