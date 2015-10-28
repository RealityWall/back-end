var pg = require('pg');
var logger = require('../logger')

var connectionString = "postgres://postgres:password@localhost/postgres";

module.exports = {
    /**
     * Params of the callback :
     * err, client, done
     * @param successCB, errorCB
     */
    connect: function (successCB, errorCB) {
        pg.connect(connectionString, function (err, client, done) {
            if (err) {
                logger('PG CONNECT ERROR : ', err);
                done(err);
                return errorCB(err);
            }

            client.sqlQuery = function (request, params, successCB, errorCB) {
                client.query(request, params, function (err, data) {
                    if (err) {
                        logger('SQL Error : ', request, err);
                        done(err);
                        return errorCB(err);
                    }

                    successCB(data);
                })
            };

            successCB(client, done);
        });
    }

};

// start database : psql -U postgres