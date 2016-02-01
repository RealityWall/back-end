'use strict';

let fs = require('fs');
let models = require('../../models');
let User = models.User;
let Session = models.Session;
let VerificationToken = models.VerificationToken;
let ResetPasswordToken = models.ResetPasswordToken;
let passwordCrypt = require('../../password-crypt');
let uuid = require('node-uuid');
let multer = require('multer');
let upload = multer({ dest: __dirname + '/../../../uploads/users' }).single('avatar');

module.exports = {

    post(req, res) {

        req.sanitizeBody('firstname').trim();
        req.sanitizeBody('lastname').trim();
        req.sanitizeBody('password').trim();

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

    put(req, res) {
        let updateQuery = {};

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
            .catch( (error) => {
                res.status(500).json(error);
            })
    },

    putPassword(req, res) {

        req.sanitizeBody('oldPassword').trim();
        req.sanitizeBody('newPassword').trim();

        req.checkBody('oldPassword', 'oldPassword cannot be empty').notEmpty();
        req.checkBody('newPassword', 'newPassword cannot be empty').notEmpty();

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);
        if (req.body.oldPassword == req.body.newPassword) return res.status(400).json(new Error('the new password must be different than the previous one.'));

        passwordCrypt
            .check(req.User.password, req.body.oldPassword)
            .then( (isPasswordChecked) => {
                if (isPasswordChecked) {
                    passwordCrypt
                        .generate(req.body.newPassword)
                        .then( (cryptedPassword) => {
                            return User
                                .update(
                                    {password: cryptedPassword},
                                    {where: {id: req.User.id}}
                                )
                        })
                        .then( () => {
                            return Session
                                .destroy({
                                    where: {
                                        $and: [
                                            {UserId: req.User.id},
                                            {sessionId: { $ne: req.headers.sessionid }}
                                        ]
                                    }
                                })
                        })
                        .then( () => {
                            res.status(200).end();
                        })
                        .catch( (error) => {
                            res.status(500).json(error);
                        });

                } else {
                    res.status(403).end();
                }
            })
            .catch( (error) => {
                res.status(500).json(error);
            })
    },

    postAvatar(req, res) {
        upload(req, res, (err) => {
            if (err) return res.status(500).json(err);

            // Everything went fine
            User
                .update(
                    { imagePath: req.file.filename},
                    { where: { id: req.User.id } }
                )
                .then( (userInstance) => {
                    // delete previous imagePath
                    if (req.User.imagePath) fs.unlink(__dirname + '/../../../uploads/users/' + req.User.imagePath);
                    res.status(201).json(req.file.filename);
                })
                .catch( (error) => {
                    res.status(500).json(error);
                });
        })
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