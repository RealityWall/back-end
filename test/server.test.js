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

    before( (done) => {
        buildServer( (_server) => {
            server = _server;
            done();
        })
    });

    after( (done) => {
        models.User.destroy({
            where: {
                email: user.email
            }
        }).then( (numberDestroyed) => {
            assert.equal(1, numberDestroyed);
            server.close(done);
        });
    });

    it('Should test something', (done) => {
        request(server)
            .post('/api/users')
            .send(user)
            .set('Accept', 'application/json')
            .end( (err, res) => {
                if (err) throw err;

                // check for good response
                assert(201, res.status);
                assert.equal(user.email, res.body.email);
                assert.equal(user.firstname, res.body.firstname);
                assert.equal(user.lastname, res.body.lastname);

                // memorize user data
                let userPassword = user.password;
                user = res.body;
                user.password = userPassword;

                done();
            });
    })

});