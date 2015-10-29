var db = require('../database');
var logger = require('../logger');

var errorCB = function (err, res) {
    return res.status(500).json({error: err});
};

module.exports = {

    selectUsers: function (req, res) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('SELECT * FROM users;', [])
                .then(function success (users) {
                    done();
                    return res.status(200).json(users);
                })
                .catch(function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    },

    getUser: function(req, res){
        db.connect(function success (client, done) {
            client
                .sqlQuery("SELECT * FROM users WHERE id=$1;", [req.params.id])
                .then(function success (result) {
                    done();
                    return res.status(200).json(result);
                })
                .catch(function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    },

    newUser: function(req, res) {
        db.connect(function success (client, done) {
            client
                .sqlQuery(
                    'INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) '
                    + 'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) '
                    + 'RETURNING *;',
                    [req.body.email, req.body.password, req.body.firstname, req.body.lastname])
                .then(function success (result) {
                    // TODO : mail de bienvenue
                    done();
                    return res.status(201).json(result);
                })
                .catch(function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    }

};