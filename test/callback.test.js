var assert = require('assert');
var callback = require('../modules/callback');
var logger = require('../modules/logger');

describe ('Callback Test', function () {
    it ('Should get all the users', function (done) {
        var res = {
            status: function() {return res;},
            json: function (data) {
                assert.equal(4, data.rows.length);
                done();
            }
        };
        callback.selectUsers({}, res);
    });

    it ('Should get the user Johny', function (done) {
        var res = {
            status: function() {return res;},
            json: function (data) {
                assert.equal("Johny", data.rows[0].firstname);
                done();
            }
        };
        callback.getUser({params:{id:3}}, res);
    });
});