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

    router.post('/posts', callback.postPosts);

    return router;

};