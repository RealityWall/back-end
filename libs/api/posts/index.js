'use strict';

const models = require('../../models');
const Post = models.Post;
const User = models.User;
const Wall = models.Wall;
const errorHandler = require('../../error-handler');
const moment = require('moment');
const child_process = require('child_process');
const fs = require('fs');
const uniqid = require('uniqid');
const htmlGenerator = require('../../../assets/pdfTemplate.js');
const Constants = require('../../../../constants.js');

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
    },

    postDownload(req, res) {

        const beginQueryDate = moment();
        beginQueryDate.date(beginQueryDate.date() - 1);
        beginQueryDate.hour(1);
        beginQueryDate.minute(0);
        beginQueryDate.second(0);
        beginQueryDate.millisecond(0);

        const endQueryDate = moment(beginQueryDate);
        endQueryDate.add(24, 'hours');

        Wall
            .findAll({
                include: [
                    {
                        model: Post,
                        where: {
                            hidden: false,
                            createdAt: {
                                $gt: beginQueryDate,
                                $lt: endQueryDate
                            }
                        },
                        include: [{model: User}]
                    }
                ]
            })
            .then((walls) => {
                let html = walls
                    .map((wall) => {
                        const posts = wall.Posts;
                        return htmlGenerator(req.params.wallId, posts.map((post) => {
                            return {
                                author: {
                                    name: post.User.firstname + ' ' + post.User.lastname,
                                    imagePath: post.User.imagePath
                                        ? Constants.SERVER.BASE_URL + '/images/users/' + post.User.imagePath
                                        : ( post.User.facebookId
                                        ? 'http://graph.facebook.com/' + post.User.facebookId + '/picture?type=square'
                                        : 'http://www.iconsfind.com/wp-content/uploads/2015/08/20150831_55e46b0caf8bf-210x210.png' )
                                },
                                message: post.content
                            }
                        }));
                    })
                    .reduce((previousValue, currentValue) => {
                        return previousValue + currentValue;
                    }, '');

                const assetsPath = __dirname + '/../../../assets';
                fs.readFile(assetsPath + '/pdfTemplate.css', 'utf8', (err, css) => {
                    if (err) return errorHandler.internalError(res)(err);
                    html = '<html><head><style>' + css + '</style></head><body>' + html + '</body></html>';
                    const uniqId = uniqid();
                    const filePath = '/tmp/pdf-' + uniqId;
                    const destinationPath = __dirname + '/../../../assets/generated_pdf/' + uniqId;
                    fs.writeFile(filePath + '.html', html, 'utf8', (err) => {
                        if (err) return errorHandler.internalError(res)(err);
                        child_process.exec(
                            'phantomjs --config='
                            + assetsPath + '/phantomConfig.json '
                            + assetsPath + '/phantomDriver.js '
                            + filePath + '.html'
                            , (err) => {
                                if (err) return errorHandler.internalError(res)(err);
                                child_process.exec(
                                    'mv ' + filePath + '.pdf' + ' ' + destinationPath + '.pdf',
                                    (err) => {
                                        if (err) {
                                            fs.unlink(filePath + '.pdf');
                                            return errorHandler.internalError(res)(err);
                                        }
                                        res.status(201).json(uniqId);
                                    }
                                );
                            }
                        );
                    });
                });
            })
            .catch(errorHandler.internalError(res));
    },

    getDownload(req, res) {
        const filePath = __dirname + '/../../../assets/generated_pdf/' + req.params.pdfId + '.pdf';
        res.download(filePath, 'report.pdf', (err) => {
            if (!err) fs.unlink(filePath);
            else res.status(404).end();
        });
    }

};