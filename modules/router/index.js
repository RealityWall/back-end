var callback = require('../callback');
var authenticate = require('./authenticate-middleware.js');

module.exports = function (router) {

    router.use(authenticate);

    router.get('/hello', callback.sayHello);

    return router;

};