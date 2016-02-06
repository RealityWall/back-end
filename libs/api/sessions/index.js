'use strict';

let models = require('../../models');
let User = models.User;
let Session = models.Session;
let passwordCrypt = require('../../password-crypt');
var uuid = require('node-uuid');
let errorHandler = require('../../error-handler');

module.exports = {

    post(req, res) {

        req.sanitizeBody('password').trim();

        req.checkBody('email', 'Invalid email').notEmpty().isEmail();
        req.checkBody('password', 'Invalid password').notEmpty();

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        User
            .findOne({
                where: {
                    email: req.body.email
                }
            })
            .then( (user) => {
                if (user) {
                    if (user.verified) {
                        passwordCrypt
                            .check(user.password, req.body.password)
                            .then( (isPasswordCorrect) => {
                                if (isPasswordCorrect) {
                                    let sessionId = uuid.v4();
                                    Session
                                        .create({
                                            UserId: user.dataValues.id,
                                            sessionId: sessionId
                                        })
                                        .then( () => {
                                            res.status(201).json(sessionId);
                                        })
                                        .catch(errorHandler.internalError(res));
                                } else {
                                    res.status(401).json(new Error('Wrong Password'));
                                }
                            })
                            .catch(errorHandler.internalError(res))
                    } else {
                        res.status(401).json(new Error('You must verify your email'));
                    }

                } else {
                    res.status(404).end(user);
                }
            })
            .catch(errorHandler.internalError(res))

    },

    'delete': (req, res) => {
        Session
            .destroy({
                where: {
                    sessionId: req.headers.sessionid
                }
            })
            .then(() => {
                res.status(204).end();
            })
            .catch(errorHandler.internalError(res));
    }

};