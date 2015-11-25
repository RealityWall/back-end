var callback = require('../callback');
var authenticate = require('./authenticate-middleware.js');

module.exports = function (router) {

    router.use(authenticate);

    router.get('/users', callback.getUsers);
    router.post('/users', callback.postUsers);
    router.put('/users', callback.putUsers);

    router.get('/sessions/:id', callback.getSessions);
    router.post('/sessions', callback.postSessions);
    router.put('/sessions', callback.putSessions);
    router.delete('/sessions', callback.deleteSessions);

    router.get('/posts/:id', callback.getPosts);
    router.post('/posts', callback.postPosts);
    router.post('/posts/:id/like', callback.upOrDownPost);
    router.post('/posts/:id/dislike', callback.upOrDownPost);

    router.get('/posts/:id/comments', callback.getCommentsByPostId);
    router.post('/posts/:id/comments', callback.postComments);
    router.post('/comments/:id/like', callback.upOrDownComment);
    router.post('/comments/:id/dislike', callback.upOrDownComment);

    router.get('/walls/:id', callback.getWalls);
    router.get('/walls/:id/posts', callback.getPostsByWallId);

    return router;

};