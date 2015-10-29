var callback = require('../callback');
var authenticate = require('./authenticate-middleware.js');

module.exports = function (router) {

    router.use(authenticate);

    //recup d'un user en fonction de son id
    router.get('/users/:id', callback.getUser);

    //inscription d'un utilisateur
    router.post('/users', callback.newUser);

    return router;

};