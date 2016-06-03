'use strict';

const assert = require('assert');
const models = require('../libs/models');
const authentication = require('../libs/authentication');

describe('Authentication Test', () => {

    let user = {
        email: 'toto@tata.com',
        password: 'password',
        firstname: 'firstname',
        lastname: 'lastname',
        roles: ['user'],
        verified: true
    };

    let sessionId = 'sessionId';

    before( (done) => {
        models
            .User
            .create(user)
            .then( (createdInstance) => {

                const password = user.password;
                user = createdInstance;
                user.password = password;

                models
                    .Session
                    .create({
                        UserId: user.id,
                        sessionId: sessionId
                    })
                    .then( () => {
                        done();
                    });
            })
    });

    after( (done) => {
        models
            .User
            .destroy({
                where: {
                    id: user.id
                }
            })
            .then( (numberDestroyed) => {
                assert.equal(1, numberDestroyed);
                done();
            })
    });

    it('Should authenticate the user', (done) => {
        const req = {headers: {sessionid: sessionId}};
        const res = {
            status: () => { return res; },
            end: () => {},
            json: () => {}
        };
        authentication.isInRole(['user', 'admin'])(req, res, () => {
            done();
        });
    });

    it('Should NOT authenticate the user because sessionId not exist', (done) => {
        const req = {headers: {sessionid: 'coucou'}};
        const res = {
            status: (statusCode) => {
                assert.equal(401, statusCode);
                return res;
            },
            end: () => { },
            json: () => {done();}
        };
        authentication.isInRole(['user', 'admin'])(req, res, () => {});
    });

    it('Should NOT authenticate the user because no UserRole Matched', (done) => {
        const req = {headers: {sessionid: sessionId}};
        const res = {
            status: (statusCode) => {
                assert.equal(403, statusCode);
                return res;
            },
            end: () => { done(); },
            json: () => {}
        };
        authentication.isInRole(['blabla', 'coucou'])(req, res, () => {});
    });

    it ('Should NOT authenticate the user because no headers.sessionid given', (done) => {
        const req = {headers: {}};
        const res = {
            status: (statusCode) => {
                assert.equal(400, statusCode);
                return res;
            },
            end: () => {},
            json: () => { done(); }
        };
        authentication.isInRole(['user', 'admin'])(req, res, () => {});
    });

});