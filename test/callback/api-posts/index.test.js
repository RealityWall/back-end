var assert = require('assert');
var db = require('../../../modules/database');
var passwordCrypt = require('../../../modules/password-crypt');
var authenticate = require('../../../modules/router/authenticate-middleware.js');
var postsApi = require('../../../modules/callback/api-posts');

describe('Api /Posts Test', function () {

    var post1 = {
        content: 'this is a post content',
        title: 'bonjour les gens',
        wall_id: null
    };

    var post2 = {
        content: 'this is a post content',
        wall_id: null,
        post_id: null
    };

    var user = {
        email: "delmotte@gorge.com",
        password: "amazing_password",
        firstname: "firstname",
        lastname: "lastname",
        session_id: "amazing_session_id"
    };

    var wall = {
        longitude: 100,
        latitude: 100,
        address: 'address',
        postal_code: 12345,
        city: 'bidon-ville'
    };

    before(function (beforeDone) {
        db.connect(function (client, done) {
            var cryptedPassword = passwordCrypt.generate(user.password);
            client
                .sqlQuery(
                    'INSERT INTO users (email, password, firstname, lastname, created_at, updated_at, session_id) ' +
                    'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp, $5) ' +
                    'RETURNING *;',
                    [user.email, cryptedPassword, user.firstname, user.lastname, user.session_id]
                ).then(function (data) {
                    user.id = data.rows[0].id;
                    return client
                        .sqlQuery(
                            'INSERT INTO walls (longitude, latitude, address, postal_code, city) ' +
                            'VALUES ($1, $2, $3, $4, $5) ' +
                            'RETURNING *;',
                            [wall.longitude, wall.latitude, wall.address, wall.postal_code, wall.city]
                        );
                }).then(function (data) {
                    post1.wall_id = data.rows[0].id;
                    post2.wall_id = data.rows[0].id;
                    wall.id = data.rows[0].id;
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
                .sqlQuery('DELETE FROM rates WHERE 1=1;')
                .then(function () {
                    return client.sqlQuery('DELETE FROM posts WHERE 1=1;');
                }).then(function () {
                    return client.sqlQuery('DELETE FROM walls WHERE id=$1;', [wall.id]);
                }).then(function () {
                    return client.sqlQuery('DELETE FROM users WHERE email=$1;', [user.email]);
                }).then(function () {
                    done();
                    afterDone();
                });
        }, function (err) {
            console.log(err);
        });
    });

    // tester post avec title
    // tester post avec title + post_id (must throw an error)
    // tester post avec post_id

    it ('Should post a ROOT post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            json: function (data) {
                post1.id = data.id;
                post2.post_id = data.id;
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: post1, url: '/posts', method: 'POST'};
        authenticate(req, {}, function () {
            postsApi.postPosts(req, res);
        });
    });

    it ('Should not post because title and post_id are present', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 400);
                return res;
            },
            json: function (data) {
                post2.id = data.id;
                assert.equal('cannot have a title and a post_id', data.message);
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: {
            content: 'this is a post content',
            title: 'bonjour les gens',
            post_id: post1.id,
            wall_id: wall.id
        }, url: '/posts', method: 'POST'};
        authenticate(req, {}, function () {
            postsApi.postPosts(req, res);
        });
    });

    it ('Should post a comment to the ROOT post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            json: function (data) {
                post2.id = data.id;
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: post2, url: '/posts', method: 'POST'};
        authenticate(req, {}, function () {
            postsApi.postPosts(req, res);
        });
    });

    it ('Should like the ROOT post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            end: function () {
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, url: '/posts/' + post1.id + '/like', method: 'POST', params: {id: post1.id}};
        authenticate(req, {}, function () {
            postsApi.upOrDownPost(req, res);
        });
    });

    it ('Should unlike the ROOT post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            end: function () {
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, url: '/posts/' + post1.id + '/dislike', method: 'POST', params: {id: post1.id}};
        authenticate(req, {}, function () {
            postsApi.upOrDownPost(req, res);
        });
    });

});