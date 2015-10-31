'use strict';

var assert = require('assert');
var db = require('../../../modules/database');
var passwordCrypt = require('../../../modules/password-crypt');
var sessionsApi = require('../../../modules/callback/api-sessions');
var authenticate = require('../../../modules/router/authenticate-middleware.js');

describe('Api /Sessions Test', function () {

    var user = {
        email: 'mail@mail.com',
        password: 'password'
    };

    before(function (beforeDone) {
        db.connect(function (client, done) {
            var cryptedPassword = passwordCrypt.generate(user.password);
            client
                .sqlQuery(
                    'INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) ' +
                    'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) RETURNING *;',
                    [user.email, cryptedPassword, 'toto', 'tata']
                )
                .then(function (data) {
                    done();
                    beforeDone();
                });
        }, function (err) {
            console.log(err);
        });
    });

    after(function (afterDone) {
        db.connect(function (client, done) {
            client
                .sqlQuery('DELETE FROM users WHERE email=$1;', [user.email])
                .then(function () {
                    done();
                    afterDone();
                });
        });
    });

    it ('Post on Sessions', function (done) {
        var res = {
            status: function (code) {
                assert.equal(201, code);
                return res;
            },
            json: function (data) {
                user.sessionId = data.sessionId;
                assert(data.sessionId.length > 0);
                done()
            }
        };
        sessionsApi.postSessions({body: user}, res);
    });

   it ('Put on Sessions', function (done) {
        var res = {
            status: function (code) {
                assert.equal(202, code);
                return res;
            },
            json: function (data) {
                user.sessionId = data.sessionId;
                assert(data.sessionId.length > 0);
                done()
            }
        };
        var req = {headers: {sessionId: user.sessionId}, url:'/sessions', method: 'PUT'};
        authenticate(req, res, function () {
            sessionsApi.putSessions(req, res);
        });

    });

    it ('Get on Sessions', function (done) {
        var res = {
            status: function (code) {
                assert.equal(200, code);
                return res;
            },
            json: function (data) {
                assert.equal(data.session_id, user.sessionId);
                done()
            }
        };
        sessionsApi.getSessions({headers: {sessionId: user.sessionId}}, res);
    });

    it ('Delete on Sessions', function (done) {
        var res = {
            status: function (code) {
                assert.equal(204, code);
                return res;
            },
            end: function () {
                done()
            }
        };
        sessionsApi.deleteSessions({headers: {sessionId: user.sessionId}}, res);
    });

    it ('Get on Sessions (again)', function (done) {
        var res = {
            status: function (code) {
                assert.equal(404, code);
                return res;
            },
            json: function (data) {
                assert.equal('Not Found', data.message);
                done()
            }
        };
        sessionsApi.getSessions({headers: {sessionId: user.sessionId}}, res);
    });

});