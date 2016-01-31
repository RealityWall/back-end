'use strict';

let models = require('../../models');
let User = models.User;
let Session = models.Session;
let ResetPasswordToken = models.ResetPasswordToken;
let passwordCrypt = require('../../password-crypt');

module.exports = {

    post(req, res) {

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
                    User
                        .update({
                            password: passwordCrypt.generate(req.body.password)
                        }, {
                            where: {
                                id: resetPasswordTokenInstance.User.id
                            }
                        })
                        .then( (userInstance) => {
                            return Session // delete all session opened
                                .destroy({
                                    where: {
                                        UserId: userInstance.id
                                    }
                                }).then( () => {
                                    return ResetPasswordToken // delete all the other reset password token
                                        .destroy({
                                            where: {
                                                UserId: userInstance.id
                                            }
                                        });
                                })
                        })
                        .then( () => {
                            res.status(201).end();
                        })
                        .catch( (error) => {
                            res.status(500).json(error);
                        })
                } else {
                    res.status(404).end();
                }
            })
            .catch( (error) => {
                res.status(500).json(error);
            })

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
            .catch( (error) => {
                res.status(500).json(error);
            });

    }
};