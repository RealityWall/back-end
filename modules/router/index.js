var callback = require('../callback');
var authenticate = require('./authenticate-middleware.js');

module.exports = function (router) {

    router.use(authenticate);

    router.get('/hello', callback.sayHello);

    //recup d'un user en fonction de son id
    rouget.get('/users/:id', callback.getUser);

    //inscription d'un utilisateur
    router.post('/users', callback.newUser);

    return router;

};