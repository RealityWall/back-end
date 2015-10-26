var assert = require('assert');

describe('True Test', function () {

    it ('Should return true', function (done) {
        assert(true);
        done();
    });

    it ('Should return true', function (done) {
        assert(false);
        done();
    });

});
