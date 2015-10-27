var assert = require('assert');
var test = require('../modules/test.js');

describe('Penis Test', function () {

    it ('LoL', function (done) {
        assert(test.test(16) === 2);
        done();
    });

    it ('LoL 2', function (done) {
        assert(test.test(13) === 1);
        done();
    });

});
