var assert = require('assert');
var callback = require('../modules/callback');

describe ('Callback Test', function () {
    it ('Should get all the users', function (done) {
        var res = {
            status: function() {return res;},
            json: function (data) {
                assert.equal(0, data.rows.length)
                done();
            }
        };
        callback.selectUsers({}, res);
    });
});