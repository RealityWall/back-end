var db = require('../database');

module.exports = function (req, res, next) {

    // TODO : déterminer quelles urls doivent être protégés

    /*db.connect(function success (client, done) {
        client.sqlQuery('SELECT * FROM users WHERE sessionId=$1;', [req.headers.sessionId], function success (users) {
            done();

            if (users.rows.length == 1) {
                next();
            } else {
                return res.status(403).end();
            }

        }, function error (err) { errorCB(err, res); });
    }, function error (err) { errorCB(err, res); });*/

    next();

};