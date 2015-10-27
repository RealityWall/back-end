var test = require("./test.js");

module.exports = function (router) {

    router.post('/', function(req, res) {
        res.json(test.test(16));
    });


	return router;
};