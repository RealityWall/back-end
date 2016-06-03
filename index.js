'use strict';

const db = require('./libs/models');
const buildServer = require('./server.js');

buildServer( (server) => {

    if (process.env.NODE_ENV === 'production') {
        console.log('Express server listening on port ' + server.address().port);
    } else {
        db
            .initialize()
            .then(() => {
                console.log('Express server listening on port ' + server.address().port);
            })
            .catch((err) => {
                console.log('error while initializing db', err);
                server.close();
            });
    }

});