'use strict';

const assert = require('assert');
const buildServer = require('../server.js');
const models = require('../libs/models');
const request = require('supertest');

describe('User Route on Server API Test', () => {

    let server = null;
    let user = {
        email: 'super@developer.com',
        password: 'password',
        firstname: 'super',
        lastname: 'developer'
    };
    const newPassword = 'newPassword';

    let userNotVerified = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'omg',
        lastname: 'wtf'
    };
    let wall = null;

    before( (done) => {
        buildServer( (_server) => {
            server = _server;
            models
                .Wall
                .create({
                    latitude: 0,
                    longitude: 0,
                    address: 'address'
                })
                .then((_wall) => {
                    wall = _wall;
                    done();
                })

        });
    });

    after( (done) => {
        models
            .User
            .destroy({
                where: {
                    $or: [
                        {email: user.email},
                        {email: userNotVerified.email}
                    ]
                }
            })
            .then( (numberDestroyed) => {
                assert.equal(2, numberDestroyed);
                return models
                    .Wall
                    .destroy({
                        where: {id: wall.id}
                    });
            })
            .then( (numberDestroyed) => {
                assert.equal(1, numberDestroyed);
                server.close(done);
            });
    });

    describe('POST /users', () => {

        after( (done) => {
            request(server)
                .post('/api/users')
                .send(userNotVerified)
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);

                    // memorize user data
                    let userPassword = userNotVerified.password;
                    userNotVerified = res.body;
                    userNotVerified.password = userPassword;

                    done();
                });
        });

        it('Should create a new user', (done) => {
            request(server)
                .post('/api/users')
                .send(user)
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    assert.equal(user.email, res.body.email);
                    assert.equal(user.firstname, res.body.firstname);
                    assert.equal(user.lastname, res.body.lastname);

                    // memorize user data
                    let userPassword = user.password;
                    user = res.body;
                    user.password = userPassword;

                    done();
                });
        });

        it('Should not create a new user because duplicate email', (done) => {
            request(server)
                .post('/api/users')
                .send(user)
                .set('Accept', 'application/json')
                .end( (err, res) => {

                    // check for bad response
                    assert.equal(409, res.status);

                    done();
                });
        });

        it('Should not create new user because bad request', (done) => {
            request(server)
                .post('/api/users')
                .send({
                    email: 'caca',
                    password:'password',
                    firstname: 'firstname'
                })
                .set('Accept', 'application/json')
                .end( (err, res) => {

                    // check for bad response
                    assert.equal(400, res.status);
                    assert.equal(2, res.body.length);
                    assert.equal('email cannot be empty or must be example@domain.com format', res.body[0].msg);
                    assert.equal('missing parameter : lastname', res.body[1].msg);

                    done();
                });
        });
    });

    describe('POST /users/verify/:token', () => {

        it('Should not verify -> 404', (done) => {
            request(server)
                .post('/api/users/verify/' + 'wrong-token')
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

        it('Should verify the previous created user', (done) => {
            models
                .VerificationToken
                .findOne({
                    where: {
                        UserId: user.id
                    }
                })
                .then( (verificationToken) => {
                    request(server)
                        .post('/api/users/verify/' + verificationToken.token)
                        .set('Accept', 'application/json')
                        .end( (err, res) => {
                            if (err) throw err;

                            // check for good response
                            assert.equal(201, res.status);

                            // verify that the token has been deleted
                            models
                                .VerificationToken
                                .findOne({
                                    where: {
                                        token: verificationToken.token
                                    }
                                })
                                .then( (verificationTokenInstance) => {
                                    if (!verificationTokenInstance) done();
                                });
                        });
                })
        });

    });

    describe('POST /sessions', () => {

        it('Should Log In User', (done) => {
            request(server)
                .post('/api/sessions')
                .send({
                    email: user.email,
                    password: user.password
                })
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    user.sessionId = res.body;

                    done();
                });
        });

    });

    describe('POST /users/organization', () => {

        it('Should not create a new user beacuse NOT AUTHORIZED #403', (done) => {
            request(server)
                .post('/api/users/organization')
                .send(user)
                .set('sessionid', user.sessionId)
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    // check for bad response
                    assert.equal(403, res.status);


                    done();
                });
        });

    });

    describe('POST /users/messenger', () => {

        it('Should not create a new user beacuse NOT AUTHORIZED #403', (done) => {
            request(server)
                .post('/api/users/messenger')
                .send(user)
                .set('sessionid', user.sessionId)
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    // check for bad response
                    assert.equal(403, res.status);


                    done();
                });
        });

    });

    describe('POST /users/forgot-password', () => {

        it ('Should send a forget password request', (done) => {
            request(server)
                .post('/api/users/forgot-password')
                .send({email: user.email})
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);

                    // create one again
                    request(server)
                        .post('/api/users/forgot-password')
                        .send({email: user.email})
                        .set('Accept', 'application/json')
                        .end( () => {
                            // create one again
                            request(server)
                                .post('/api/users/forgot-password')
                                .send({email: user.email})
                                .set('Accept', 'application/json')
                                .end( () => {
                                    done();
                                });
                        });
                });
        });

        it ('Should NOT send a forget password request because email does not exists', (done) => {
            request(server)
                .post('/api/users/forgot-password')
                .send({email: user.email + 'a'})
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

        it ('Should NOT send a forget password request because user is NOT VERIFIED', (done) => {
            request(server)
                .post('/api/users/forgot-password')
                .send({email: userNotVerified.email})
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(401, res.status);
                    done();
                });
        });

    });

    describe('DELETE /users/reset-password/:token', () => {

        it('Should delete the first reset password token', (done) => {
            models
                .ResetPasswordToken
                .findOne({
                    where: {
                        UserId: user.id
                    }
                })
                .then( (resetPasswordTokenInstance) => {
                    request(server)
                        .del('/api/users/reset-password/' + resetPasswordTokenInstance.token)
                        .set('Accept', 'application/json')
                        .end( (err, res) => {
                            if (err) throw err;

                            // check for good response
                            assert.equal(204, res.status);

                            done();
                        });
                });
        });

        it('Should not delete because token NOT EXISTS', (done) => {
            request(server)
                .del('/api/users/reset-password/' + 'coucou')
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

    });

    describe('POST /users/reset-password/:token', () => {

        it('Should not update the password because NO PASSWORD given', (done) => {
            models
                .ResetPasswordToken
                .findOne({
                    where: {
                        UserId: user.id
                    }
                })
                .then( (resetPasswordTokenInstance) => {
                    request(server)
                        .post('/api/users/reset-password/' + resetPasswordTokenInstance.token)
                        .set('Accept', 'application/json')
                        .end( (err, res) => {

                            if (err) throw err;

                            // check for good response
                            assert.equal(400, res.status);

                            done();

                        });
                });
        });

        it('Should update the password of the user', (done) => {
            models
                .ResetPasswordToken
                .findOne({
                    where: {
                        UserId: user.id
                    }
                })
                .then( (resetPasswordTokenInstance) => {
                    request(server)
                        .post('/api/users/reset-password/' + resetPasswordTokenInstance.token)
                        .send({password: newPassword})
                        .set('Accept', 'application/json')
                        .end( (err, res) => {
                            if (err) throw err;

                            // check for good response
                            assert.equal(201, res.status);
                            user.password = newPassword;

                            // check that the previous session has been deleted
                            models
                                .Session
                                .findOne({
                                    where: {
                                        UserId: user.id
                                    }
                                })
                                .then( (sessionInstance) => {
                                    assert.equal(null, sessionInstance);

                                    // check taht all reset password token (2) has been deleted
                                    models
                                        .ResetPasswordToken
                                        .findOne({
                                            where: {
                                                UserId: user.id
                                            }
                                        })
                                        .then( (resetPasswordTokenInstance) => {
                                            assert.equal(null, resetPasswordTokenInstance);

                                            // log the user in again
                                            request(server)
                                                .post('/api/sessions')
                                                .send({
                                                    email: user.email,
                                                    password: user.password
                                                })
                                                .set('Accept', 'application/json')
                                                .end( (err, res) => {
                                                    if (err) throw err;

                                                    // check for good response
                                                    assert.equal(201, res.status);
                                                    user.sessionId = res.body;

                                                    done();
                                                });
                                        });
                                });
                        });
                });
        });

        it('Should not trigger request because WRONG TOKEN', (done) => {
            request(server)
                .post('/api/users/reset-password/' + 'coucou')
                .send({password: newPassword})
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();

                });
        });

    });

    describe('POST /users/avatar', () => {

        it('Should upload an image', (done) => {
            request(server)
                .post('/api/users/avatar')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .attach('avatar', __dirname + '/test.png')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);
                    user.imagePath = res.body;

                    done();
                });
        });

        it('Should not upload an image because wrong session', (done) => {
            request(server)
                .post('/api/users/avatar')
                .set('Accept', 'application/json')
                .set('sessionid', 'wrong-session-uuid')
                .attach('avatar', __dirname + '/test.png')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(401, res.status);

                    done();
                });
        });


    });

    describe('DELETE /users/avatar', () => {
        it('Should delete an image', (done) => {
            request(server)
                .delete('/api/users/avatar')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(204, res.status);
                    user.imagePath = '';

                    done();
                });
        });
    });

    describe('PUT /users/password', () => {

        let newAmazingPassword = 'newAmazingPassword';
        let sessionId = null;
        it('Should update the password of the user', (done) => {

            // create a sessionId for the next test
            request(server)
                .post('/api/sessions')
                .send({
                    email: user.email,
                    password: user.password
                })
                .set('Accept', 'application/json')
                .end( (err, res) => {
                    if (err) throw err;

                    assert.equal(201, res.status);
                    sessionId = res.body;

                    // do the test here
                    request(server)
                        .put('/api/users/password')
                        .set('Accept', 'application/json')
                        .set('sessionid', user.sessionId)
                        .send({oldPassword: user.password, newPassword: newAmazingPassword})
                        .end( (err, res) => {
                            if (err) throw err;

                            // check for good response
                            assert.equal(200, res.status);
                            user.password = newAmazingPassword;

                            done();
                        });

                });

        });

        it('Should not update the password because the sessionId has expired', (done) => {
            request(server)
                .put('/api/users/password')
                .set('Accept', 'application/json')
                .set('sessionid', sessionId)
                .send({oldPassword: user.password, newPassword: newPassword})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for bad response
                    assert.equal(401, res.status);

                    done();
                });
        });

        it('Should not update the password because the previous is wrong', (done) => {
            request(server)
                .put('/api/users/password')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .send({oldPassword: 'wrong-password', newPassword: newPassword})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });

    });

    describe('PUT /users', () => {

        it('should not change anything', (done) => {
            request(server)
                .put('/api/users')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(200, res.status);

                    done();
                });
        });

        it('should change firstname and lastname', (done) => {
            request(server)
                .put('/api/users')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .send({firstname: 'jean-yves', lastname:'delmotte'})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(200, res.status);

                    done();
                });
        })
    });

    describe('POST /walls/:id/posts', () => {

        it ('Should throw 404 because wall not exists :/', (done) => {
            request(server)
                .post('/api/walls/999/posts')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .send({content: 'lorem ipsum dolor'})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(404, res.status);

                    done();
                });
        });

        it ('Should post a message on the wall', (done) => {
            request(server)
                .post('/api/walls/' + wall.id + '/posts')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .send({content: 'lorem ipsum dolor'})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(201, res.status);

                    done();
                });
        });

        it ('Should not post a message on the wall because already done today', (done) => {
            request(server)
                .post('/api/walls/' + wall.id + '/posts')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .send({content: 'lorem ipsum dolor'})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(409, res.status);

                    done();
                });
        });

    });

    describe('GET /walls/:id/posts', () => {
        it ('Should not get message on the wall 403', (done) => {
            request(server)
                .get('/api/walls/' + wall.id + '/posts')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });
    });

    describe('PUT /walls/:id/posts', () => {
        it ('Should not put message on the wall 403', (done) => {
            request(server)
                .put('/api/walls/' + wall.id + '/posts/2')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });
    });

    describe('POST /walls', () => {

        it('Should not post a new wall', (done) => {
            request(server)
                .post('/api/walls')
                .send({
                    address: 'yeah',
                    longitude : 0,
                    latitude: 0
                })
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });

    });

    describe('PUT /walls', () => {

        it('Should not put a new wall', (done) => {
            request(server)
                .put('/api/walls/2')
                .send({
                    address: 'yeah',
                    longitude : 0,
                    latitude: 0
                })
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });

    });

    describe('POST /walls/:id/pictures', () => {
        it ('Should not upload image for today because do not have necessary rights', (done) => {
            request(server)
                .post('/api/walls/2/pictures')
                .set('Content-Type', 'multipart/form-data')
                .set('sessionid', user.sessionId)
                .field('date', new Date().toISOString())
                .attach('picture', __dirname + '/test.png')
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });
    });

    describe('DELETE /walls', () => {

        it('Should not delete a new wall', (done) => {
            request(server)
                .delete('/api/walls/2')
                .send({
                    address: 'yeah',
                    longitude : 0,
                    latitude: 0
                })
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(403, res.status);

                    done();
                });
        });

    });

    describe('DELETE /sessions', () => {
        it('should not change anything', (done) => {
            request(server)
                .delete('/api/sessions')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(204, res.status);

                    done();
                });
        });
    });



});