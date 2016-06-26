'use strict';

const models = require('../../models');
const Post = models.Post;
const errorHandler = require('../../error-handler');
const moment = require('moment');

module.exports = {

    post(req, res) {
        req.sanitizeBody('content').trim();
        req.checkBody('content', 'content must be > 1 and < 255').isLength({min: 1, max: 255});

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        const today = moment();
        today.hour(1);
        today.minute(0);
        today.second(0);
        today.millisecond(0);

        const releaseDate = moment(new Date(2016, 6, 14, 0, 0, 0, 0));

        Post
            .findOne({
                where: {
                    UserId: req.User.id,
                    hasBeenDisplayed: false,
                    createdAt: {
                        $lt: releaseDate
                    }
                }
            })
            .then((postInstance) => {
                if (postInstance) {
                    res.status(409).json(new Error('already posted today'));
                } else {
                    Post
                        .create({
                            content: req.body.content,
                            UserId: req.User.id
                        })
                        .then((createdInstance) => {
                            // TODO : POST slack
                            res.status(201).json(createdInstance);
                        })
                        .catch((error) => {
                            if (error.name == 'SequelizeForeignKeyConstraintError') return res.status(404).end();
                            errorHandler.internalError(res)(error);
                        });
                }
            })
            .catch((err) => {
                console.log(err);
                errorHandler.internalError(res)(err)
            });
    }

};