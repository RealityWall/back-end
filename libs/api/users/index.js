'use strict';

let models = require('../../models');
let User = models.User;
let VerificationToken = models.VerificationToken;
let ResetPasswordToken = models.ResetPasswordToken;
let passwordCrypt = require('../../password-crypt');
let uuid = require('node-uuid');

module.exports = {

    post(req, res) {

        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();
        req.checkBody('firstname', 'missing parameter : firstname').notEmpty();
        req.checkBody('lastname', 'missing parameter : lastname').notEmpty();
        req.checkBody('password', 'missing parameter : password').notEmpty();

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        passwordCrypt
            .generate(req.body.password)
            .then( (cryptedPassword) => {
                return User
                    .create({
                        email: req.body.email,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        password: cryptedPassword,
                        roles: ['user'],
                        verified: false
                    });
            })
            .then((createdInstance) => {
                let verificationToken = uuid.v4();
                return VerificationToken
                    .create({
                        UserId: createdInstance.dataValues.id,
                        token: verificationToken
                    })
                    .then( () => {
                        delete createdInstance.dataValues.password;
                        res.status(201).json(createdInstance);

                        // TODO : send validation mail

                    });
            })
            .catch((error) => {
                if (error.name == 'SequelizeUniqueConstraintError') return res.status(409).json(error);
                res.status(500).json(error);
            });


    },

    verify(req, res) {

        req.checkParams('token', 'missing param : token').notEmpty();

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        VerificationToken
            .findOne({
                where: {
                    token: req.params.token
                }
            })
            .then( (verificationToken) => {
                if (verificationToken) {
                    User
                        .update(
                            { verified: true },
                            { where: { id: verificationToken.UserId } }
                        )
                        .then( () => {
                            verificationToken.destroy();
                            res.status(201).end();
                        })
                        .catch( (error) => {
                            res.status(500).json(error);
                        });
                } else {
                    res.status(404).end();
                }
            })
            .catch( (error) => {
                res.status(500).json(error);
            });
    },

    forgotPassword(req, res) {

        req.checkBody('email', 'email cannot be empty or must be example@domain.com format').notEmpty().isEmail();

        let errors = req.validationErrors();
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
                        let verificationToken = uuid.v4();
                        ResetPasswordToken
                            .create({
                                UserId: user.dataValues.id,
                                token: verificationToken
                            })
                            .then( () => {
                                res.status(201).end();

                                // TODO : send reset link in a mail

                            })
                            .catch( (error) => {
                                res.status(500).json(error);
                            });
                    } else {
                        res.status(401).json(new Error('You must verify your email first'));
                    }
                } else {
                    res.status(404).end();
                }
            })
            .catch((error) => {
                res.status(500).json(error);
            });
    }

};