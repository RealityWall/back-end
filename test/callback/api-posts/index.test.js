var assert = require('assert');
var db = require('../../../modules/database');
var passwordCrypt = require('../../../modules/password-crypt');
var authenticate = require('../../../modules/router/authenticate-middleware.js');
var postsApi = require('../../../modules/callback/api-posts');

describe('Api /Posts Test', function () {

    var post = {
        content: 'this is a post content',
        title: 'bonjour les gens',
        wall_id: null
    };

    var post2 = {
        content: 'this is a post content',
        title: 'bonjour les gens',
        wall_id: null
    };

    var comment = {
        content: 'this is a post content'
    };

    var comment2 = {
        content: 'this is a post content 2'
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
                    post.wall_id = data.rows[0].id;
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
            Promise.all([
                client.sqlQuery('DELETE FROM posts_rates WHERE 1=1;'),
                client.sqlQuery('DELETE FROM comments_rates WHERE 1=1;'),
                client.sqlQuery('DELETE FROM comments WHERE 1=1;'),
                client.sqlQuery('DELETE FROM posts WHERE 1=1;'),
                client.sqlQuery('DELETE FROM walls WHERE id=$1;', [wall.id]),
                client.sqlQuery('DELETE FROM users WHERE email=$1;', [user.email])
            ]).then(function () {
                done();
                afterDone();
            });
        }, function (err) {
            console.log(err);
        });
    });

    it ('Should post a post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            json: function (data) {
                post.id = data.id;
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: post, url: '/posts', method: 'POST'};
        authenticate(req, {}, function () {
            postsApi.postPosts(req, res);
        });
    });

    it ('Should post post2', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            json: function (data) {
                post.id = data.id;
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: post2, url: '/posts', method: 'POST'};
        authenticate(req, {}, function () {
            postsApi.postPosts(req, res);
        });
    });

    it ('Should get the post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 200);
                return res;
            },
            json: function (data) {
                assert.equal(post.title, data.title);
                done();
            }
        };
        postsApi.getPosts({ params: {id: post.id}, url: '/posts', method: 'GET'}, res);
    });

    it ('Should post a comment to the post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            json: function (data) {
                comment.id = data.id;
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: comment, url: '/posts/' + post.id + '/comments', method: 'POST', params: {id: post.id}};
        authenticate(req, {}, function () {
            postsApi.postComments(req, res);
        });
    });

    it ('Should post another comment to the post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            json: function (data) {
                comment2.id = data.id;
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, body: comment2, url: '/posts/' + post.id + '/comments', method: 'POST', params: {id: post.id}};
        authenticate(req, {}, function () {
            postsApi.postComments(req, res);
        });
    });

    it ('Should like the post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            end: function () {
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, url: '/posts/' + post.id + '/like', method: 'POST', params: {id: post.id}};
        authenticate(req, {}, function () {
            postsApi.upOrDownPost(req, res);
        });
    });

    it ('Should unlike the post', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            end: function () {
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, url: '/posts/' + post.id + '/dislike', method: 'POST', params: {id: post.id}};
        authenticate(req, {}, function () {
            postsApi.upOrDownPost(req, res);
        });
    });

    it('Should like a comment', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            end: function () {
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, url: '/comments/' + comment.id + '/like', method: 'POST', params: {id: comment.id}};
        authenticate(req, {}, function () {
            postsApi.upOrDownComment(req, res);
        });
    });

    it('Should like a comment', function (done) {
        var res = {
            status: function(code) {
                assert.equal(code, 201);
                return res;
            },
            end: function () {
                done();
            }
        };
        var req = { headers: {sessionId: user.session_id}, url: '/comments/' + comment.id + '/dislike', method: 'POST', params: {id: comment.id}};
        authenticate(req, {}, function () {
            postsApi.upOrDownComment(req, res);
        });
    });

    describe('get posts by wall id', function () {
        it ('Should get the posts by wall id WITHOUT offset and limit', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (posts) {
                    assert.equal(2, posts.length);
                    assert(posts[0].score > posts[1].score);
                    assert.equal(user.firstname, posts[0].firstname);
                    assert.equal(user.lastname, posts[0].lastname);
                    assert.equal(3, posts[0].score);
                    assert.equal(0, posts[1].score);
                    done();
                }
            };
            postsApi.getPostsByWallId({params: {id: wall.id}, query: {},  url: '/walls/' + wall.id + '/posts', method: 'GET'}, res);
        });

        it ('Should get the posts by wall id WITH limit WITHOUT offset', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (posts) {
                    assert.equal(1, posts.length);
                    assert.equal(3, posts[0].score);
                    done();
                }
            };
            postsApi.getPostsByWallId({params: {id: wall.id}, query: {limit: 1},  url: '/walls/' + wall.id + '/posts', method: 'GET'}, res);
        });

        it ('Should get the posts by wall id WITH limit AND offset', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (posts) {
                    assert.equal(1, posts.length);
                    assert.equal(0, posts[0].score);
                    done();
                }
            };
            postsApi.getPostsByWallId({params: {id: wall.id}, query: {limit: 1, offset: 1},  url: '/walls/' + wall.id + '/posts', method: 'GET'}, res);
        });
    });

    describe('get comments by post id', function () {
        it ('Should get the comments by post id WITHOUT offset and limit and order', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (comments) {
                    assert.equal(2, comments.length);
                    assert.equal(1, comments[0].score);
                    assert.equal(user.firstname, comments[0].firstname);
                    assert.equal(user.lastname, comments[0].lastname);
                    assert.equal(user.id, comments[0].user_id);
                    done();
                }
            };
            postsApi.getCommentsByPostId({params: {id: post.id}, query: {},  url: '/posts/' + post.id + '/comments', method: 'GET'}, res);
        });

        it ('Should get the comments by post id WITHOUT offset and order WITH limit', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (comments) {
                    assert.equal(1, comments.length);
                    assert.equal(1, comments[0].score);
                    done();
                }
            };
            postsApi.getCommentsByPostId({params: {id: post.id}, query: {limit: 1},  url: '/posts/' + post.id + '/comments', method: 'GET'}, res);
        });

        it ('Should get the comments by post id WITHOUT order WITH limit and offset', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (comments) {
                    assert.equal(1, comments.length);
                    assert.equal(0, comments[0].score);
                    done();
                }
            };
            postsApi.getCommentsByPostId({params: {id: post.id}, query: {limit: 1, offset: 1},  url: '/posts/' + post.id + '/comments', method: 'GET'}, res);
        });

        it ('Should get the comments by post id WITH order and limit and offset', function (done) {
            var res = {
                status: function(code) {
                    assert.equal(code, 200);
                    return res;
                },
                json: function (comments) {
                    assert.equal(2, comments.length);
                    assert.equal(user.firstname, comments[0].firstname);
                    assert.equal(user.lastname, comments[0].lastname);
                    assert(new Date(comments[0].created_at) >= new Date(comments[1].created_at));
                    done();
                }
            };
            postsApi.getCommentsByPostId({params: {id: post.id}, query: {order: 'time'},  url: '/posts/' + post.id + '/comments', method: 'GET'}, res);
        });
    });


});