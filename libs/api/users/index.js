'use strict';

const models = require('../../models');
const request = require('request');
const moment = require('moment');
const User = models.User;
const Session = models.Session;
const Post = models.Post;
const sequelize = models.sequelize;
const mailer = require('../../mailer');
const VerificationToken = models.VerificationToken;
const ResetPasswordToken = models.ResetPasswordToken;
const passwordCrypt = require('../../password-crypt');
const uuid = require('node-uuid');
const errorHandler = require('../../error-handler');
const uniqid = require('uniqid');

module.exports = {

    'get': (req, res) => {
        delete req.User.password;
        delete req.User.dataValues.password;

        const releaseDate = moment(new Date(2016, 6, 14, 0, 0, 0, 0));

        Post
            .findOne({
                where: {
                    UserId: req.User.id,
                    hasBeenDisplayed: false,
                    createdAt: {
                        $lt: releaseDate
                    }
                },
                order: '"createdAt" DESC'
            })
            .then((lastPostInstance) => {
                req.User.dataValues.lastPost = lastPostInstance;
                res.status(200).json(req.User);
            })
            .catch((err) => {
                console.log(err);
                errorHandler.internalError(res)(err)
            });
    },

    post(req, res) {

        req.sanitizeBody('firstname').trim();
        req.sanitizeBody('lastname').trim();
        req.sanitizeBody('password').trim();

        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();
        req.checkBody('firstname', 'missing parameter : firstname').notEmpty();
        req.checkBody('lastname', 'missing parameter : lastname').notEmpty();
        req.checkBody('password', 'missing parameter : password').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        passwordCrypt
            .generate(req.body.password)
            .then( (cryptedPassword) => {
                let _createdInstance = {};
                sequelize.transaction((t) => {
                    return User
                        .create({
                            email: req.body.email,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            password: cryptedPassword,
                            roles: ['user'],
                            verified: false
                        }, {transaction: t})
                        .then((createdInstance) => {
                            _createdInstance = createdInstance;
                            const verificationToken = uuid.v4();
                            return VerificationToken
                                .create({
                                    UserId: _createdInstance.dataValues.id,
                                    token: verificationToken
                                }, {transaction: t});
                        })
                })
                .then((verificationTokenInstance) => {
                    delete _createdInstance.dataValues.password;
                    res.status(201).json(_createdInstance);

                    mailer.sendVerificationMail(_createdInstance.dataValues, verificationTokenInstance.dataValues.token)
                })
                .catch(errorHandler.internalErrorOrUniqueConstraint(res));
            })
            .catch(errorHandler.internalError(res));


    },

    postOrganization(req, res) {
        req.sanitizeBody('firstname').trim();
        req.sanitizeBody('lastname').trim();

        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();
        req.checkBody('firstname', 'missing parameter : firstname').notEmpty();
        req.checkBody('lastname', 'missing parameter : lastname').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        const password = uniqid();

        passwordCrypt
            .generate(password)
            .then( (cryptedPassword) => {
                User
                    .create({
                        email: req.body.email,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        password: cryptedPassword,
                        roles: ['organization'],
                        verified: true
                    })
                    .then((createdInstance) => {
                        res.status(201).json(createdInstance);
                        createdInstance.dataValues.password = password;
                        mailer.sendCreatedMail(createdInstance.dataValues, 'organization');
                    })
                    .catch(errorHandler.internalErrorOrUniqueConstraint(res));
            })
            .catch(errorHandler.internalError(res));
    },

    postMessenger(req, res) {
        req.sanitizeBody('firstname').trim();
        req.sanitizeBody('lastname').trim();

        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();
        req.checkBody('firstname', 'missing parameter : firstname').notEmpty();
        req.checkBody('lastname', 'missing parameter : lastname').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        const password = uniqid();

        passwordCrypt
            .generate(password)
            .then( (cryptedPassword) => {
                User
                    .create({
                        email: req.body.email,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        password: cryptedPassword,
                        roles: ['messenger'],
                        verified: true
                    })
                    .then((createdInstance) => {
                        res.status(201).json(createdInstance);
                        mailer.sendCreatedMail(createdInstance.dataValues, 'messenger');
                    })
                    .catch(errorHandler.internalErrorOrUniqueConstraint(res));
            })
            .catch(errorHandler.internalError(res));
    },

    put(req, res) {
        const updateQuery = {};

        req.sanitizeBody('firstname').trim();
        req.sanitizeBody('lastname').trim();

        if (req.body.firstname && req.body.firstname != req.User.firstname) updateQuery.firstname = req.body.firstname;
        if (req.body.lastname && req.body.lastname != req.User.lastname) updateQuery.lastname = req.body.lastname;
        if (!updateQuery.firstname && !updateQuery.lastname) {
            return res.status(200).end();
        }

        User
            .update(
                updateQuery,
                { where: { id: req.User.id } }
            )
            .then( () => {
                res.status(200).end();
            })
            .catch(errorHandler.internalError(res))
    },

    putPassword(req, res) {

        if (req.User.facebookId) return res.status(403).end();

        //req.sanitizeBody('oldPassword').trim();
        //req.sanitizeBody('newPassword').trim();

        req.checkBody('oldPassword', 'oldPassword cannot be empty').notEmpty();
        req.checkBody('newPassword', 'newPassword cannot be empty').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);
        if (req.body.oldPassword == req.body.newPassword) return res.status(400).json(new Error('the new password must be different than the previous one.'));

        passwordCrypt
            .check(req.User.password, req.body.oldPassword)
            .then( (isPasswordChecked) => {
                if (isPasswordChecked) {
                    passwordCrypt
                        .generate(req.body.newPassword)
                        .then( (cryptedPassword) => {
                            sequelize.transaction((t) => {
                                    return User
                                        .update(
                                            {password: cryptedPassword},
                                            {where: {id: req.User.id}, transaction: t}
                                        )
                                        .then(() => {
                                            return Session
                                                .destroy({
                                                    where: {
                                                        $and: [
                                                            {UserId: req.User.id},
                                                            {sessionId: { $ne: req.headers.sessionid }}
                                                        ]
                                                    },
                                                    transaction: t
                                                });
                                        })
                            })
                            .then(() => {
                                res.status(200).end();
                            })
                            .catch(errorHandler.internalError(res));
                        })
                        .catch(errorHandler.internalError(res));

                } else {
                    res.status(403).end();
                }
            })
            .catch(errorHandler.internalError(res))
    },

    verify(req, res) {

        req.checkParams('token', 'missing param : token').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        VerificationToken
            .findOne({
                where: {
                    token: req.params.token
                }
            })
            .then( (verificationToken) => {
                if (verificationToken) {
                    sequelize.transaction((t) => {
                        return User
                            .update(
                                { verified: true },
                                { where: { id: verificationToken.UserId } , transaction: t}
                            )
                            .then( () => {
                                return verificationToken
                                    .destroy({transaction: t});
                            });
                    })
                    .then(() => {
                        res.status(201).end();
                    })
                    .catch(errorHandler.internalError(res));
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res));
    },

    forgotPassword(req, res) {

        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        User
            .findOne({
                where: {
                    email: req.body.email
                }
            })
            .then((user) => {
                if (user) {
                    if (user.dataValues.verified) {
                        if (user.dataValues.facebookId) {
                            res.status(403).end();
                        } else {
                            const verificationToken = uuid.v4();
                            ResetPasswordToken
                                .create({
                                    UserId: user.dataValues.id,
                                    token: verificationToken
                                })
                                .then( () => {
                                    res.status(201).end();

                                    // send reset link in a mail
                                    mailer.sendPasswordResetLink(user.dataValues, verificationToken);

                                })
                                .catch(errorHandler.internalError(res));
                        }
                    } else {
                        res.status(401).json(new Error('You must verify your email first'));
                    }
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res));
    },

    facebook(req, res) {
        request.get(
            'https://graph.facebook.com/me' +
            '?access_token=' + req.body.accessToken + '&fields=email,first_name,last_name',
            (err, response) => {
                if (err) return errorHandler.internalError(res)(err);
                if (response.statusCode !== 200) return res.status(response.statusCode).json(response.body);

                const body = JSON.parse(response.body);
                if (body.id != req.body.facebookId) return req.status(401).json(new Error('facebookId doesn\'t match'));

                User
                    .findOne({
                        where: {
                            email: body.email
                        }
                    })
                    .then((userInstance) => {
                        if (userInstance) {
                            if (userInstance.dataValues.facebookId) {
                                const sessionId = uuid.v4();
                                Session
                                    .create({
                                        UserId: userInstance.dataValues.id,
                                        sessionId: sessionId
                                    })
                                    .then( () => {
                                        res.status(201).json(sessionId);
                                    })
                                    .catch(errorHandler.internalError(res));
                            } else {
                                res.status(409).json(new Error('this email already exists'));
                            }
                        } else {
                            const sessionId = uuid.v4();
                            sequelize.transaction((t) => {
                                return User
                                    .create({
                                        email: body.email,
                                        firstname: body.first_name,
                                        lastname: body.last_name,
                                        password: null,
                                        roles: ['user'],
                                        verified: true,
                                        facebookId: body.id
                                    }, {transaction: t})
                                    .then( (userInstance) => {
                                        return Session
                                            .create({
                                                UserId: userInstance.dataValues.id,
                                                sessionId: sessionId
                                            }, {transaction: t});
                                    })
                            })
                            .then( () => {
                                res.status(201).json(sessionId);
                            })
                            .catch(errorHandler.internalErrorOrUniqueConstraint(res));
                        }
                    })
                    .catch(errorHandler.internalError(res));
            }
        );
    },

    didNotReceiveMail(req, res) {
        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        User
            .findOne({
                where: {
                    verified: false,
                    email: req.body.email
                },
                include: [{ model: VerificationToken }]
            })
            .then((userInstance) => {
                if (userInstance && userInstance.VerificationTokens && userInstance.VerificationTokens.length > 0) {
                    mailer.sendVerificationMail(userInstance.dataValues, userInstance.dataValues.VerificationTokens[0].token);
                    res.status(201).end();
                } else {
                    res.status(409).end();
                }
            })
            .catch(errorHandler.internalError(res));
    }

};