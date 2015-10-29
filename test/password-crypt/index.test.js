import bcrypt from "../modules/password-crypt";
import assertfrom 'assert';

describe ('Callback Test', function () {
	let password = "best_password_ever",
		cryptedPassword = "";

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