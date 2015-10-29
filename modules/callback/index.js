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
            client.sqlQuery('SELECT * FROM users WHERE id=$1', [req.params.id], function success (users) {
                done();
                return res.status(200).json(users);
            }, function error (err) { errorCB(err, res); });
        }, function error (err) { errorCB(err, res); });
    }

};