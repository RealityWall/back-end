var db = require('../database');
var callback = require('../callback');

module.exports = function (req, res, next) {

    if (req.url.indexOf('/sessions') == 0 && req.method == 'PUT') {
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
        callback.getSessions(req, newRes);
    }

    next();

};