'use strict';

const models = require('../../models');
const Post = models.Post;
const User = models.User;
const Wall = models.Wall;
const errorHandler = require('../../error-handler');
const moment = require('moment');

module.exports = {

    'get': (req, res) => {

        const oldestPostId = req.query.oldestPostId;
        const mostRecentPostId = req.query.mostRecentPostId;

        const query = {
            where: {
                hidden: false
            },
            include: [
                {model: User},
                {model: Wall}
            ],
            order: 'id DESC',
            limit: 40
        };
        if (mostRecentPostId) {
            query.where.id = {$gt: mostRecentPostId};
        } else if (oldestPostId) {
            query.where.id = {$lt: oldestPostId};
        }

        Post
            .findAll(query)
            .then((posts) => {
                res.status(200).json(posts);
            })
            .catch(errorHandler.internalError(res));
    }

};