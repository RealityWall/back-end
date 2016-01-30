'use strict';

let buildServer = require('./server.js');
buildServer( (server) => {
    console.log('Express server listening on port ' + server.address().port);
});