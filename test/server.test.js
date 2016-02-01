'use strict';

let assert = require('assert');
let buildServer = require('../server.js');
let models = require('../libs/models');
let request = require('supertest');
let fs = require('fs');

describe('Server API Test', () => {

    let server = null;
    let user = {
        email: 'super@developer.com',
        password: 'password',
        firstname: 'super',
        lastname: 'developer'
    };
    let newPassword = 'newPassword';

    let userNotVerified = {
        email: 'test@test.com',
        password: 'password',
        firstname: 'omg',
        lastname: 'wtf'
    };

    before( (done) => {
        buildServer( (_server) => {
            server = _server;
            done();
        })
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
                fs.unlink(__dirname + '/../uploads/users/' + user.imagePath, function () {
                    server.close(done);
                });

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

    describe('POST /users/picture', () => {

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
                    assert.equal(404, res.status);

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

                    // check for good response
                    assert.equal(404, res.status);

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

        it('Should not update the password because the new password is empty', (done) => {
            request(server)
                .put('/api/users/password')
                .set('Accept', 'application/json')
                .set('sessionid', user.sessionId)
                .send({oldPassword: 'wrong-password', newPassword: '       '})
                .end( (err, res) => {
                    if (err) throw err;

                    // check for good response
                    assert.equal(400, res.status);

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


});