'use strict';

const models = require('../libs/models');
const Post = models.Post;
const User = models.User;
const fs = require('fs');

Post
    .findAll({
        where: {
            hasBeenDisplayed: false
        },
        include: [{model: User}]
    })
    .then((posts) => {
        fs.writeFileSync(__dirname + '/posts.json', JSON.stringify(posts), {encoding: 'utf8'});
        console.log('SUCCESS');
        process.exit();
    })
    .catch((err) => {
        console.log('ERROR', err);
        process.exit();
    });