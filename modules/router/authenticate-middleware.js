var db = require('../database');
var callback = require('../callback');

module.exports = function (req, res, next) {

    if (
        req.url.indexOf('/sessions') == 0
        || req.url.indexOf('/users') == 0 && req.method == 'GET'
        || req.url.indexOf('/users') == 0 && req.method == 'POST'
        || req.url.indexOf('/posts') == 0 && req.method == 'POST'
    ) {
        var newRes = {
            status: function (code) {
                if (code == 200) {
                    return newRes;
                } else {
                    res.status(403).end();
                    return newRes;
                }
            },
            json: function (data) {
                if (data.session_id) {
                    req.user = data;
                    next();
                }
            }
        };
        return callback.getSessions(req, newRes);
    }

    next();

};