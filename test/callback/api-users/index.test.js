var users = require('../../../modules/callback/api-users');
var db = require('../../../modules/database');
var assert = require('assert');
var passwordCrypt = require('../../../modules/password-crypt');

describe ('Api-users tests', function () {
	var req = null;
	var userToUpdate = {
		body:{
			email: 'jean-gorge@gmail.com',
			firstname: 'test_jean',
			lastname: 'test_gorge',
			password: 'epic_password'
		}
	};

    var cryptedPassword = passwordCrypt.generate(userToUpdate.body.password);
	
	beforeEach(function (beforeEachDone) {
		req = {
			body: 
			{
				email: 'anthony.sarais@gmail.com',
				firstname: 'anthony',
				lastname: 'sarais',
				password: 'password'
			}
		};

		db.connect(function succes(client, done){
			client
                .sqlQuery(
                    'INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) ' +
                    'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) RETURNING *;'
                    , [userToUpdate.body.email, cryptedPassword
                    , userToUpdate.body.firstname, userToUpdate.body.lastname]
                )
                .then(function (data) {
                    done();
                    beforeEachDone();
                });
		});
	});

	after(function (doneAfter) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('DELETE FROM users WHERE email=$1;', ["anthony.sarais@gmail.com"])
                .then(function success () {
                    done();
                    doneAfter();
                });
        });
    });

    afterEach(function (afterEachDone){
    	db.connect(function success (client, done) {
            client
                .sqlQuery('DELETE FROM users WHERE email=$1 OR firstname=$2 OR lastname=$3', 
                	[userToUpdate.body.email, userToUpdate.body.firstname, userToUpdate.body.lastname])
                .then(function success () {
                    done();
                    afterEachDone();
                });
        });
    });



	it('Should add a new user', function(done){
		var res = {
            status: function() {return res;},
            json: function (data) {
                assert.equal(1, data.rowCount);
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : mail input empty', function(done){
		req.body.email = "";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "mail input empty");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : firtname input empty', function(done){
		req.body.firstname = "";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "firtname input empty");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : lastname input empty', function(done){
		req.body.lastname = "";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "lastname input empty");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : bad mail format V1', function(done){
		req.body.email = "zeezefze";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "bad mail format");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : bad mail format V2', function(done){
		req.body.email = "fqzelblzebf.qfqef@qzfqzef";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "bad mail format");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : firstname bad size', function(done){
		req.body.firstname = "12345678901234567890123456789012345678901234567890"
		+"123456789012345678901234567890123456789012345678901";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "firstname size must be between 1 and 100");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : lastname bad size', function(done){
		req.body.lastname = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
		+"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "lastname size must be between 1 and 100");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : password too small', function(done){
		req.body.password = "aaa";
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "password size must be between 7 and 30");
                done();
            }
        };
		users.postUsers(req, res);
	});

	it('Should not add a new user : password too big', function(done){
		req.body.password = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
		var res = {
            status: function(code) {
            	assert.equal(code, 400);
            	return res;
            },
            json: function (data) {
            	assert.equal(data.message, "password size must be between 7 and 30");
                done();
            }
        };
		users.postUsers(req, res);
	});


	//PARTIE UPDATE

	it('Should update the user : firstname', function(){
		userToUpdate.body.newFirstname = "jeannnnn";
		var res = {
            status: function(code) {
            	assert.equal(code, 202);
            	return res;
            },
            json: function (data) {
            	assert.equal(1, data.rowCount);
            	assert.equal(data.rows[0].firstname);
                done();
            }
        };
		users.putUsers(userToUpdate, res);
	});

	it('Should update the user : lastname', function(){
		userToUpdate.body.newLastName = "gorgeeeeee";
		var res = {
            status: function(code) {
            	assert.equal(code, 202);
            	return res;
            },
            json: function (data) {
            	assert.equal(1, data.rowCount);
            	assert.equal(data.rows[0].lastname);
                done();
            }
        };
		users.putUsers(userToUpdate, res);
	});

	it('Should update the user : email', function(){
		userToUpdate.body.newEmail = "jeannnn.gorgeeeeee@gmail.com";
		var res = {
            status: function(code) {
            	assert.equal(code, 202);
            	return res;
            },
            json: function (data) {
            	assert.equal(1, data.rowCount);
            	assert.equal(data.rows[0].email);
                done();
            }
        };
		users.putUsers(userToUpdate, res);
	});

	it('Should update the user : password', function(){
		userToUpdate.body.newPassword = "fhorigoeshgsoierg";
		var res = {
            status: function(code) {
            	assert.equal(code, 202);
            	return res;
            },
            json: function (data) {
            	assert.equal(1, data.rowCount);
            	assert(passwordCrypt.check(userToUpdate.body.newPassword, data.rows[0].password));
                done();
            }
        };
		users.putUsers(userToUpdate, res);
	});

	it('Should update the user : firstname + lastname + password', function(){
		userToUpdate.body.newFirstname = "jeannnnn";
		userToUpdate.body.newLastName = "gorgeeee";
		userToUpdate.body.newPassword = "qfefqefes";
		var res = {
            status: function(code) {
            	assert.equal(code, 202);
            	return res;
            },
            json: function (data) {
            	assert.equal(1, data.rowCount);
            	assert.equal(data.rows[0].firstname);
            	assert.equal(data.rows[0].lastname);
            	assert(passwordCrypt.check(userToUpdate.body.newPassword, data.rows[0].password));
                done();
            }
        };
		users.putUsers(userToUpdate, res);
	});


});