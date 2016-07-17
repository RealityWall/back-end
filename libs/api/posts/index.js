'use strict';

const models = require('../../models');
const Post = models.Post;
const errorHandler = require('../../error-handler');
const moment = require('moment');
const request = require('request');
const SLACK_HOOK = require('../../../../constants').SLACK_HOOK;

module.exports = {

    post(req, res) {
        req.sanitizeBody('content').trim();
        req.checkBody('content', 'content must be > 1 and < 255').isLength({min: 1, max: 255});

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        const today = moment();
        today.hour(0);
        today.minute(0);
        today.second(0);
        today.millisecond(1);

        const tommorow = moment(today);
        tommorow.add(24, 'hours');

        Post
            .findOne({
                where: {
                    UserId: req.User.id,
                    createdAt: {
                        $gt: today,
                        $lt: tommorow
                    }
                },
                limit: 1,
                order: '"createdAt" DESC'
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
                            res.status(201).json(createdInstance);
                            request({
                                url: SLACK_HOOK,
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                json: true,
                                body: {
                                    text: '"' + req.body.content + '" - ' + req.User.firstname + ' ' + req.User.lastname
                                }
                            }, function (err) {
                                if (err) {
                                    console.log(new Date(), 'Error while posting message to slack', err);
                                }
                            })
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