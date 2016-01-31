'use strict';

let models = require('../../models');
let User = models.User;
let VerificationToken = models.VerificationToken;
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

        User
            .create({
                email: req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                password: passwordCrypt.generate(req.body.password),
                roles: ['user'],
                verified: false
            })
            .then((createdInstance) => {
                let verificationToken = uuid.v4();
                VerificationToken
                    .create({
                        UserId: createdInstance.dataValues.id,
                        token: verificationToken
                    })
                    .then( () => {
                        delete createdInstance.dataValues.password;
                        res.status(201).json(createdInstance);

                        // TODO : send validation mail

                    })
                    .catch( (error) => {
                        res.status(500).json(error);
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
                        .update({
                            verified: true
                        }, {
                            where: {
                                id: verificationToken.UserId
                            }
                        })
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

    }

};