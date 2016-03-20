'use strict';

const fs = require('fs');
const models = require('../../../models/index');
const request = require('request');
const User = models.User;
const multer = require('multer');

const acceptedMimeTypes = ['image/png', 'image/x-png', 'image/gif', 'image/jpeg', 'image/pjpeg'];
const upload = multer({
    dest: __dirname + '/../../../../uploads/users',
    limits: {
        fileSize: 2 * 1000000,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        cb(null, acceptedMimeTypes.indexOf(file.mimetype) >= 0);
    }
}).single('avatar');
const errorHandler = require('../../../error-handler/index');

module.exports = {

    post(req, res) {
        upload(req, res, (err) => {
            if (err) return errorHandler.internalError(res)(err);
            if (!req.file || !req.file.filename) {
                console.log('missing file');
                return res.status(400).json(new Error('missing file'));
            }

            // Everything went fine
            User
                .update(
                    {imagePath: req.file.filename},
                    {where: {id: req.User.id}}
                )
                .then(() => {
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
                    {imagePath: ''},
                    {where: {id: req.User.id}}
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