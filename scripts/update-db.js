'use strict';

const models = require('../libs/models');
const Post = models.Post;

Post
    .update({
        hasBeenDisplayed: true
    },{
        where: {
            hasBeenDisplayed: false
        }
    })
    .then(() => {
        console.log('SUCCESS');
        process.exit();
    })
    .catch((err) => {
        console.log('ERROR', err);
        process.exit();
    })