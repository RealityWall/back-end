'use strict';

const models = require('../../../models/index');
const User = models.User;
const Session = models.Session;
const sequelize = models.sequelize;
const ResetPasswordToken = models.ResetPasswordToken;
const passwordCrypt = require('../../../password-crypt/index');
const errorHandler = require('../../../error-handler/index');

module.exports = {

    post(req, res) {

        req.sanitizeBody('password').trim();

        req.checkParams('token', 'missing param : token').notEmpty();
        req.checkBody('password', 'missing param : password').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        ResetPasswordToken
            .findOne({
                where: {
                    token: req.params.token
                },
                include: [ User ]
            })
            .then( (resetPasswordTokenInstance) => {
                if (resetPasswordTokenInstance) {
                    passwordCrypt
                        .generate(req.body.password)
                        .then( (cryptedPassword) => {
                            sequelize.transaction((t) => {
                                return User
                                    .update({
                                        password: cryptedPassword
                                    }, {
                                        where: {
                                            id: resetPasswordTokenInstance.User.id
                                        },
                                        transaction: t
                                    })
                                    .then( () => {
                                        return Session // delete all session opened
                                            .destroy({
                                                where: {
                                                    UserId: resetPasswordTokenInstance.User.id
                                                },
                                                transaction: t
                                            });
                                    })
                                    .then( () => {
                                        return ResetPasswordToken // delete all the other reset password token
                                            .destroy({
                                                where: {
                                                    UserId: resetPasswordTokenInstance.User.id
                                                },
                                                transaction: t
                                            });
                                    })
                            })
                            .then(() => {
                                res.status(201).end();
                            })
                            .catch(errorHandler.internalError(res));
                        })
                        .catch(errorHandler.internalError(res))
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res))

    },

    'delete': (req, res) => {

        req.checkParams('token', 'missing param : token').notEmpty();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        ResetPasswordToken
            .destroy({
                where: {
                    token: req.params.token
                }
            })
            .then( (numberDestroyed) => {
                if (numberDestroyed > 0) {
                    res.status(204).end();
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res));

    }
};