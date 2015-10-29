var db = require('../database');
var logger = require('../logger');

var errorCB = function (err, res) {
    return res.status(500).json({error: err});
};

module.exports = {

    sayHello: function (req, res) {
        return res.status(200).json({message: 'HELLO'});
    },


    selectUsers: function (req, res) {

        db.connect(function success (client, done) {
            client.sqlQuery('SELECT * FROM users;', [], function success (users) {

                done();
                return res.status(200).json(users);

            }, function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    },

    getUser: function(req, res){
        db.connect(function success (client, done) {
            client.sqlQuery("SELECT * FROM users WHERE id=$1;", [req.params.id], function success (result) {
                done();
                return res.status(200).json(result);
            }, function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    },

    newUser: function(req, res){
        db.connect(function success (client, done) {
            client.sqlQuery('INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) '
                +'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp);', 
                    [req.body.email, req.body.password, req.body.firstname, req.body.lastname], function success (result) {
                        done();
                        return res.status(200).json(result);
            }, function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    }

};