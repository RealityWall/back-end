var pg = require('pg');
var logger = require('../logger');
var jsonfile = require('jsonfile');

var passwords = jsonfile.readFileSync('passwords.json');

var connectionString = "postgres://postgres:"+passwords.database+"@localhost/postgres";

module.exports = {

    /**
     * Connect to PG DataBase
     * @param successCB
     * @param errorCB
     */
    connect: function (successCB, errorCB) {
        pg.connect(connectionString, function (err, client, done) {
            if (err) {
                logger.error('PG CONNECT ERROR : ', err);
                done(err);
                return errorCB(err);
            }

            /**
             * Custom SQL Query function using Promises
             * @param request
             * @param params
             */
            client.sqlQuery = function (request, params) {
                return new Promise(function (resolve, reject) {
                    client.query(request, params, function (err, data) {
                        if (err) {
                            console.log(err);
                            logger.error('SQL Error : ', request, err);
                            done(err);
                            return reject(err);
                        }

                        resolve(data);
                    })
                });

            };

            successCB(client, done);
        });
    }

};

// start database : psql -U postgres