'use strict';

const errorHandler = require('../../../../error-handler');
const child_process = require('child_process');
const fs = require('fs');
const uniqid = require('uniqid');
const models = require('../../../../models');
const Post = models.Post;
const User = models.User;
const htmlGenerator = require('../../../../../assets/pdfTemplate.js');
const Constants = require('../../../../../../constants.js');
const moment = require('moment');

module.exports = {

    post(req, res) {

        req.checkParams('wallId', 'wallId must be an integer').isInt();
        if (req.query.date) {
            req.checkQuery('date', 'date must be a date').isDate();
        }

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        // is there a date ? if no take today
        let beginQueryDate = req.query.date ? moment(req.query.date) : moment();
        beginQueryDate.hour(1);
        beginQueryDate.minute(0);
        beginQueryDate.second(0);
        beginQueryDate.millisecond(0);

        let endQueryDate = moment(beginQueryDate);
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
                let html = htmlGenerator(req.params.wallId, posts.map((post) => {
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

                let assetsPath = __dirname + '/../../../../../assets';
                fs.readFile(assetsPath + '/pdfTemplate.css', 'utf8', (err, css) => {
                    if (err) return errorHandler.internalError(res)(err);
                    html = '<html><head><style>' + css + '</style></head><body>' + html + '</body></html>';
                    let uniqId = uniqid();
                    let filePath = '/tmp/pdf-' + uniqId;
                    let destinationPath = __dirname + '/../../../../../assets/generated_pdf/' + uniqId;
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

    'get': (req, res) => {
        let filePath = __dirname + '/../../../../../assets/generated_pdf/' + req.params.pdfId + '.pdf';
        res.download(filePath, 'report.pdf', (err) => {
            if (!err) fs.unlink(filePath);
            else res.status(404).end();
        });
    }

};