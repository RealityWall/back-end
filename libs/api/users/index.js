'use strict';

let User = require('../../models').User;
let passwordCrypt = require('../../password-crypt');

module.exports = {

    post(req, res) {
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
                delete createdInstance.dataValues.password;
                res.status(201).json(createdInstance);
            })
            .catch((error) => {
                res.status(500).json(error);
            });
    }

};