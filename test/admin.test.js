'use strict';

let assert = require('assert');
let buildServer = require('../server.js');
let models = require('../libs/models');
let passwordCrypt = require('../libs/password-crypt');
let request = require('supertest');
let fs = require('fs');

describe('Admin Route on Server API Test', () => {

    let user = {
        email: 'admin@reality-wall.fr',
        password: 'password',
        firstname: 'admin',
        lastname: 'admin'
    };
    let sessionId = 'sessionId';

    let wall = {
        address: 'ADDRESS1 ADDRESS2 31000 TOULOUSE',
        longitude: 1.438672,
        latitude: -43.43829798
    };

    let server = null;
    before( (done) => {
        buildServer( (_server) => {
            server = _server;
            passwordCrypt
                .generate(user.password)
                .then((cryptedPassword) => {
                    models.User
                        .create({
                            email: user.email,
                            password: cryptedPassword,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            verified: true,
                            roles: ['admin']
                        })
                        .then((createdInstance) => {
                            user.id = createdInstance.id;
                            return models
                                .Session
                                .create({
                                    UserId: user.id,
                                    sessionId: sessionId
                                })

                        })
                        .then(() => {done();})
                });
        });
    });

    after((done) => {
        models.User
            .destroy({
                where: {id: user.id}
            })
            .then(() => {
                server.close(done);
            });
    });

    describe('POST /walls', () => {

        it('Should create a new wall', (done) => {
            request(server)
                .post('/api/walls')
                .send(wall)
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    wall.id = res.body.id;

                    done();
                });
        });

        it('Should not create a new wall because empty address and non float lat, lng', (done) => {
            request(server)
                .post('/api/walls')
                .send({
                    address: '',
                    latitude: 'bonjour',
                    longitude: 181
                })
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(400, res.status);

                    // because :
                    // 1) no address
                    // 2) latitude is a string
                    // 3) longitude > 180
                    assert.equal(3, res.body.length);

                    done();
                });
        });

    });

    describe('GET /walls', () => {
        it('Should get the new wall', (done) => {
            request(server)
                .get('/api/walls')
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(200, res.status);
                    assert.equal(1, res.body.length);

                    done();
                });
        });
    });

    describe('PUT /walls/:id', () => {

        it('should update the previous created wall', (done) => {
            request(server)
                .put('/api/walls/' + wall.id)
                .send({address: 'this is an amazing address'})
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(200, res.status);
                    wall.address = 'this is an amazing address';

                    done();
                });
        });

        it('should not update a wall that not exists', (done) => {
            request(server)
                .put('/api/walls/-2')
                .send({address: 'this is an amazing address'})
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

    });

    describe('POST /walls/:id/photos', () => {
        it ('Should upload image for today', (done) => {
            request(server)
                .post('/api/walls/' + wall.id + '/pictures')
                .set('Content-Type', 'multipart/form-data')
                .set('sessionid', sessionId)
                .field('date', new Date().toISOString())
                .attach('picture', __dirname + '/test.png')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    wall.imagePath = res.body;

                    done();
                });
        });
        it ('Should update image for today', (done) => {
            request(server)
                .post('/api/walls/' + wall.id + '/pictures')
                .set('Content-Type', 'multipart/form-data')
                .set('sessionid', sessionId)
                .field('date', new Date().toISOString())
                .attach('picture', __dirname + '/test.png')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    wall.imagePath = res.body;

                    done();
                });
        });

        it ('Should not create image for today because wall not exists', (done) => {
            request(server)
                .post('/api/walls/999/pictures')
                .set('Content-Type', 'multipart/form-data')
                .set('sessionid', sessionId)
                .field('date', new Date().toISOString())
                .attach('picture', __dirname + '/test.png')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

    });

    describe('GET /walls/:id', () => {

        it ('should get the provous updated wall', (done) => {
            request(server)
                .get('/api/walls/' + wall.id)
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(200, res.status);
                    assert.equal(1, res.body.Pictures.length);

                    done();
                });
        });

        it ('should not get the wall because 404', (done) => {
            request(server)
                .get('/api/walls/-2' )
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

    });

    describe('POST /walls/:id/posts', () => {

        it ('Should get one post', (done) => {
            request(server)
                .post('/api/walls/' + wall.id + '/posts')
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });

    });

    let post = null;
    describe('GET /walls/:id/posts', () => {

        it ('Should get one post', (done) => {
            models
                .Post
                .create({
                    content: 'lorem ipsum dolor',
                    WallId: wall.id,
                    UserId: user.id
                })
                .then(() => {

                    request(server)
                        .get('/api/walls/' + wall.id + '/posts')
                        .set('Accept', 'application/json')
                        .set('sessionid', sessionId)
                        .end( (err, res) => {
                            if (err) throw err;

                            // check for good response
                            assert.equal(200, res.status);
                            assert(1, res.body.length);
                            post = res.body[0];

                            done();
                        });

                });
        });

    });

    describe('PUT /walls/:id/posts/:id', () => {

        it ('Should update post', (done) => {
            request(server)
                .put('/api/walls/' + wall.id + '/posts/' + post.id)
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(200, res.status);

                    done();
                });
        });

        it ('Should not update one post', (done) => {
            request(server)
                .put('/api/walls/999/posts/' + post.id)
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

        it ('Should not update one post', (done) => {
            request(server)
                .put('/api/walls/' + wall.id + '/posts/999')
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

    });

    describe('DELETE /walls/:id', () => {

        it ('should delete the previous updated wall', (done) => {
            request(server)
                .delete('/api/walls/' + wall.id)
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(204, res.status);
                    fs.unlink(__dirname + '/../uploads/walls/' + wall.imagePath);

                    done();
                });
        });

        it ('should not delete the previous updated wall because not exists', (done) => {
            request(server)
                .delete('/api/walls/' + wall.id)
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

    });

});