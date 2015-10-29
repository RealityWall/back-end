var callback = require('../callback');
var authenticate = require('./authenticate-middleware.js');

module.exports = function (router) {

    router.use(authenticate);

    //inscription d'un utilisateur
    router.post('/users', callback.postUsers);

    router.post('/sessions', callback.postSessions);
    router.put('/sessions', callback.putSessions);

    return router;

};