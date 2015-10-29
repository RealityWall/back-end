var assert = require('assert');
var callback = require('../modules/callback');
var logger = require('../modules/logger');
var db = require('../modules/database');

describe ('Callback Test', function () {

    var newUser = {
        email: "jeanjacquegoldman@gmail.com",
        password: "password",
        firstname: "jean-jacque",
        lastname: "goldman"
    };

    after(function (doneAfter) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('DELETE FROM users WHERE email=$1;', [newUser.email])
                .then(function success () {
                    done();
                    doneAfter();
                });
        });
    });

    it ('Should add a new user', function (done) {
        var res = {
            status: function(code) {
                assert.equal(201, code);
                return res;
            },
            json: function (data) {
                assert.equal(1, data.rowCount);
                newUser = data.rows[0];
                done();
            }
        };
        callback.newUser({ body: newUser }, res);
    });

    it ('Should get all the users', function (done) {
        var res = {
            status: function(code) {
                assert.equal(200, code);
                return res;
            },
            json: function (data) {
                assert.equal(1, data.rows.length);
                done();
            }
        };
        callback.selectUsers({}, res);
    });

    it ('Should get the user Johny', function (done) {
        var res = {
            status: function(code) {
                assert.equal(200, code);
                return res;
            },
            json: function (data) {
                assert.equal(newUser.email, data.rows[0].email);
                done();
            }
        };
        callback.getUser({params:{id: newUser.id}}, res);
    });



});