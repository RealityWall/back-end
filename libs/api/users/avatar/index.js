'use strict';

let fs = require('fs');
let models = require('../../../models/index');
let request = require('request');
let User = models.User;
let multer = require('multer');
let upload = multer({ dest: __dirname + '/../../../../uploads/users' }).single('avatar');
let errorHandler = require('../../../error-handler/index');

module.exports = {

    post(req, res) {
        upload(req, res, (err) => {
            if (err) return errorHandler.internalError(res)(err);
            if (!req.file.filename) return res.status(400).json(new Error('missing file'));

            // Everything went fine
            User
                .update(
                    { imagePath: req.file.filename},
                    { where: { id: req.User.id } }
                )
                .then( () => {
                    // delete previous imagePath
                    if (req.User.imagePath) fs.unlink(__dirname + '/../../../../uploads/users/' + req.User.imagePath);
                    res.status(201).json(req.file.filename);
                })
                .catch(errorHandler.internalError(res));
        });
    },

    'delete': (req, res) => {
        if (req.User.imagePath) {
            User
                .update(
                    { imagePath: ''},
                    { where: { id: req.User.id } }
                )
                .then(() => {
                    fs.unlink(__dirname + '/../../../../uploads/users/' + req.User.imagePath);
                    res.status(204).end();
                })
                .catch(errorHandler.internalError(res))
        } else {
            res.status(204).end();
        }
    }

};