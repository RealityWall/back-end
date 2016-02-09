'use strict';

let models = require('../../models');
let Picture = models.Picture;
let multer = require('multer');
let moment = require('moment');
let upload = multer({ dest: __dirname + '/../../../uploads/walls' }).single('picture');
let errorHandler = require('../../error-handler');
let fs = require('fs');

module.exports = {

    // TODO : check params after upload :(
    // TODO : TEST UniqueKey
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
                    date: pictureDate,
                    WallId: req.params.id
                })
                .then((picture) => {
                    if (picture) {
                        fs.unlink(__dirname + '/../../../uploads/walls/' + picture.imagePath);
                        return picture.update({
                            imagePath: req.file.filename
                        })
                    } else {
                        return Picture
                            .create({
                                imagePath : req.file.filename,
                                date: pictureDate,
                                WallId: req.params.id
                            })
                    }
                })
                .then((pictureInstance) => {
                    res.status(201).json(pictureInstance);
                })
                .catch((err) => {
                    console.log(err);
                    // if wallId does not exist -> destroy the picture
                    res.status(500).json(err);
                });
        });


    }

};