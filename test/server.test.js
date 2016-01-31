'use strict';

let assert = require('assert');
let buildServer = require('../server.js');
let models = require('../libs/models');
let request = require('supertest');

describe('Server API Test', () => {

    let server = null;
    let user = {
        email: 'super@developer.com',
        password: 'password',
        firstname: 'super',
        lastname: 'developer'
    };
    let newPassword = 'newPassword';

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
                    email: user.email
                }
            })
            .then( (numberDestroyed) => {
                assert.equal(1, numberDestroyed);
                server.close(done);
            });
    });

    describe('POST /users', () => {

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
                            done();
                        });
                });
        });

        // TODO : Test with a user that is not verified
        // TODO : Test with a wrong email (404)

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

        // TODO : test with 404 token

    });

    describe('POST /users/reset-password/:token', () => {

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

                            done();
                        });
                });
        });

        // TODO : test errors (no password, wrong token)
        // TODO : verify that all passwordToken are destroyed (==> create another one)
        // TODO : test that the previous sessions has been deleted
        // TODO : create a new sessionId with the new password

    });


});