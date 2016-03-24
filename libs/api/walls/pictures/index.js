'use strict';

let models = require('../../../models/index');
let Wall = models.Wall;
let Picture = models.Picture;
let multer = require('multer');
let moment = require('moment');
const acceptedMimeTypes = ['image/png', 'image/x-png', 'image/gif', 'image/jpeg', 'image/pjpeg'];
let upload = multer({
    dest: __dirname + '/../../../../uploads/walls', limits: {
        fileSize: 2 * 1000000,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        cb(null, acceptedMimeTypes.indexOf(file.mimetype) >= 0);
    }
}).single('picture');
let errorHandler = require('../../../error-handler/index');
let fs = require('fs');

module.exports = {

    post(req, res) {
        req.checkParams('wallId', 'wallId must be an integer').isInt();

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        // upload the picture
        upload(req, res, (err) => {
            if (err) return errorHandler.internalError(res)(err);
            if (!req.file.filename) return res.status(400).json(new Error('missing image'));

            req.checkBody('date', 'must be a date').isDate();
            let errors = req.validationErrors();
            if (errors) {
                fs.unlink(__dirname + '/../../../../uploads/walls/' + req.file.filename);
                return res.status(400).json(errors);
            }

            let pictureDate = moment(req.body.date);
            pictureDate.hour(1);
            pictureDate.minute(0);
            pictureDate.second(0);
            pictureDate.millisecond(0);

            Picture
                .findOne({
                    where: {
                        date: pictureDate,
                        WallId: req.params.wallId
                    }
                })
                .then((picture) => {
                    if (picture) {
                        // if the picture already exists we juste update it and delete the previous
                        fs.unlink(__dirname + '/../../../../uploads/walls/' + picture.imagePath);
                        picture
                            .update({
                                imagePath: req.file.filename
                            })
                            .then(() => {
                                res.status(201).json(req.file.filename);
                            })
                            .catch(errorHandler.internalError(res));
                    } else {
                        // if the picture does not exists we check that the wall exists
                        Wall
                            .findOne({
                                where: {id: req.params.wallId}
                            })
                            .then((wall) => {
                                if (wall) {
                                    Picture
                                        .create({
                                            imagePath: req.file.filename,
                                            date: pictureDate,
                                            WallId: req.params.wallId
                                        })
                                        .then(() => {
                                            res.status(201).json(req.file.filename);
                                        })
                                        .catch(errorHandler.internalError(res));
                                } else {
                                    fs.unlink(__dirname + '/../../../../uploads/walls/' + req.file.filename);
                                    res.status(404).end();
                                }
                            })
                            .catch(errorHandler.internalError(res));
                    }
                })
                .catch(errorHandler.internalError(res));
        });


    }

};