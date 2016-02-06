'use strict';

let models = require('../../models');
let User = models.User;
let Session = models.Session;
let sequelize = models.sequelize;
let ResetPasswordToken = models.ResetPasswordToken;
let passwordCrypt = require('../../password-crypt');
let errorHandler = require('../../error-handler');

module.exports = {

    post(req, res) {

        req.sanitizeBody('password').trim();

        req.checkParams('token', 'missing param : token').notEmpty();
        req.checkBody('password', 'missing param : password').notEmpty();

        let errors = req.validationErrors();
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

        let errors = req.validationErrors();
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