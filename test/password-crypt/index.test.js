var bcrypt = require("../../modules/password-crypt");
var assert = require('assert');

describe ('Callback Test', function () {
	var password = "best_password_ever";
	var cryptedPassword = "";

	it('Should generate a password', function(done){
		cryptedPassword = bcrypt.generate(password);
		assert(cryptedPassword != password);
		done();
	});

	it('Should return the original password', function(done){
		assert(bcrypt.check(cryptedPassword, password));
		done();
	});

});