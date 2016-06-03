'use strict';

const models = require('../../../models');
const Post = models.Post;
const User = models.User;
const errorHandler = require('../../../error-handler');
const moment = require('moment');

module.exports = {

    'get': (req, res) => {
        req.checkParams('wallId', 'wallId must be an integer').isInt();
        if (req.query.date) {
            req.checkQuery('date', 'date must be a date').isDate();
        }

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        // is there a date ? if no take today
        const beginQueryDate = req.query.date ? moment(req.query.date) : moment();
        beginQueryDate.hour(1);
        beginQueryDate.minute(0);
        beginQueryDate.second(0);
        beginQueryDate.millisecond(0);

        const endQueryDate = moment(beginQueryDate);
        endQueryDate.add(24, 'hours');

        Post
            .findAll({
                where: {
                    WallId: req.params.wallId,
                    hidden: false,
                    createdAt: {
                        $gt: beginQueryDate,
                        $lt: endQueryDate
                    }
                },
                include: [
                    {model: User}
                ]
            })
            .then((posts) => {
                res.status(200).json(posts);
            })
            .catch(errorHandler.internalError(res));
    },

    post(req, res) {
        req.sanitizeBody('content').trim();
        req.checkParams('wallId', 'wallId must be an integer').isInt();
        req.checkBody('content', 'content must be > 1 and < 255').isLength({min: 1, max: 255});

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        // is there a date ? if no take today
        const today = moment();
        today.hour(1);
        today.minute(0);
        today.second(0);
        today.millisecond(0);

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
                            UserId: req.User.id,
                            WallId: req.params.wallId
                        })
                        .then((createdInstance) => {
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
    },

    put(req, res) {
        req.checkParams('wallId', 'wallId must be an integer').isInt();
        req.checkParams('postId', 'postId must be an integer').isInt();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        Post
            .update({
                hidden: true
            }, {
                where: {
                    WallId: req.params.wallId,
                    id: req.params.postId
                }
            })
            .then((affectedRows) => {
                if (affectedRows.length > 0 && affectedRows[0] == 1) {
                    res.status(200).end();
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res));
    }

};