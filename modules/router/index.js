var callback = require('../callback');
var authenticate = require('./authenticate-middleware.js');

module.exports = function (router) {

    router.use(authenticate);

    router.get('/hello', callback.sayHello);

    rouget.get('/user/:id', callback.getUser);
    
    return router;

};