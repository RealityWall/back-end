'use strict';

let models = require('../../models');
let Wall = models.Wall;
let Picture = models.Picture;
let multer = require('multer');
let moment = require('moment');
let upload = multer({ dest: __dirname + '/../../../uploads/walls' }).single('picture');
let errorHandler = require('../../error-handler');
let fs = require('fs');

module.exports = {

    post(req, res) {
        req.checkParams('id', 'id must be an integer').isInt();

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        // upload the picture
        upload(req, res, (err) => {
            if (err) return errorHandler.internalError(res)(err);
            if (!req.file.filename) return res.status(400).json(new Error('missing image'));

            req.checkBody('date', 'must be a date').isDate();
            let errors = req.validationErrors();
            if (errors) {
                fs.unlink(__dirname + '/../../../uploads/walls/' + req.file.filename);
                return res.status(400).json(errors);
            }

            let pictureDate = moment(req.body.date);
            pictureDate.hour(0);
            pictureDate.minute(0);
            pictureDate.second(0);
            pictureDate.millisecond(0);

            Picture
                .findOne({
                    where: {
                        date: pictureDate,
                        WallId: req.params.id
                    }
                })
                .then((picture) => {

                    if (picture) {
                        // if the picture already exists we juste update it and delete the previous
                        fs.unlink(__dirname + '/../../../uploads/walls/' + picture.imagePath);
                        picture.update({
                            imagePath: req.file.filename
                        }).then((pictureInstance) => {
                            res.status(201).json(pictureInstance);
                        })
                    } else {
                        // if the picture does not exists we check that the wall exists
                        Wall
                            .findOne({
                                where: {id: req.params.id}
                            })
                            .then((wall) => {
                                if (wall) {
                                    Picture
                                        .create({
                                            imagePath : req.file.filename,
                                            date: pictureDate,
                                            WallId: req.params.id
                                        })
                                        .then((pictureInstance) => {
                                            res.status(201).json(pictureInstance);
                                        })
                                } else {
                                    fs.unlink(__dirname + '/../../../uploads/walls/' + req.file.filename);
                                    res.status(404).end();
                                }
                            });
                    }
                })
                .catch((err) => {
                    res.status(500).json(err);
                });
        });


    }

};