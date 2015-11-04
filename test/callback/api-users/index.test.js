var users = require('../../../modules/callback/api-users');
var db = require('../../../modules/database');
var assert = require('assert');
var authenticate = require('../../../modules/router/authenticate-middleware.js');
var sessionsApi = require('../../../modules/callback/api-sessions');

describe ('Api /Users tests', function () {

	var user = {
		email: 'jeangorge@gmail.com',
		firstname: 'test_jean',
		lastname: 'test_gorge',
		password: 'epic_password'
	};
	var sessionId = null;

	//for get test
	var userGet = {
		email: "a@b.c",
		firstname: "abcdefgh",
		lastname: "ijklmnpo",
		password: "azertyuiop",
		id: null
	};

	after(function (doneAfter) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('DELETE FROM users WHERE email=$1 OR email=$2;', [user.email, "a@b.c"])
                .then(function success () {
                    done();
                    doneAfter();
                });
        });
    });

    before(function (doneBefore) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) '
                        + 'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) '
                        + 'RETURNING *;', [userGet.email, userGet.password, userGet.firstname, userGet.lastname])
                .then(function success (data) {
                	userGet.id = data.rows[0].id;
                    done();
                    doneBefore();
                });
        });
    });

	describe ('Post Users Test', function () {

		it('Should add a new user', function(done){
			var res = {
				status: function(code) {
					assert.equal(201, code);
					return res;
				},
				json: function (data) {
					assert.equal(1, data.rowCount);

					var res = {
						status: function (code) {
							assert.equal(201, code);
							return res;
						},
						json: function (data) {
							sessionId = data.sessionId;
							done();
						}
					};
					sessionsApi.postSessions({body: user}, res);
				}
			};
			users.postUsers({body: user}, res);
		});

		it('Should not add a new user : mail input empty', function(done){
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
			users.postUsers({ body: {
				email: '',
				firstname: 'test_jean',
				lastname: 'test_gorge',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : firtname input empty', function(done){
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
			users.postUsers({ body: {
				email: 'jeangorge@gmail.com',
				firstname: '',
				lastname: 'test_gorge',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : lastname input empty', function(done){
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
			users.postUsers({ body: {
				email: 'jeangorge@gmail.com',
				firstname: 'test_jean',
				lastname: '',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : bad mail format V1', function(done){
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
			users.postUsers({ body: {
				email: 'bonjour',
				firstname: 'test_jean',
				lastname: 'test_gorge',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : bad mail format V2', function(done){
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
			users.postUsers({ body: {
				email: 'zizi.gorge@gmail',
				firstname: 'test_jean',
				lastname: 'test_gorge',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : firstname bad size', function(done){
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
			users.postUsers({ body: {
				email: 'jeangorge@gmail.com',
				firstname: 'test_jeanfeoprkoerfpoekfpoerkfperokfpeorkpeorkerpofkerpofkerpofkerpokerpokerpofk' +
				'fijrfoiejfoiejfoierjfojerojerofijerjerofjeroijerofijeorjfoierjoerjoeirjiof',
				lastname: 'test_gorge',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : lastname bad size', function(done){
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
			users.postUsers({ body: {
				email: 'jeangorge@gmail.com',
				firstname: 'test_jean',
				lastname: 'freiojeriofjeorjfoeifjeoirfjeroifjeorfjeorijfeoifjeoijeorjfeoifjeiofjerofij' +
				'freijeroijfoeijeorifjeroijeoijeroifjeroifjeroifjeoifjeroifjeoifjeroji',
				password: 'epic_password'
			}}, res);
		});

		it('Should not add a new user : password too small', function(done){
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
			users.postUsers({ body: {
				email: 'jeangorge@gmail.com',
				firstname: 'test_jean',
				lastname: 'test_gorge',
				password: 'aaa'
			}}, res);
		});

		it('Should not add a new user : password too big', function(done){
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
			users.postUsers({ body: {
				email: 'jeangorge@gmail.com',
				firstname: 'test_jean',
				lastname: 'test_gorge',
				password: 'frepokerkfpokfpeorkfpoerkfeporfkpoerkfoperkferojnvbhsdfboierhajf'
			}}, res);
		});
	});



	//PARTIE UPDATE

	describe('Put Users Test', function () {

		it('Should update the user : firstname', function(done) {
			var res = {
				status: function(code) {
					assert.equal(code, 200);
					return res;
				},
				json: function (data) {
					assert.equal(1, data.rowCount);
					assert.equal('coucou', data.rows[0].firstname);
					done();
				}
			};
			var req = { headers: {sessionId: sessionId}, body: {firstname: 'coucou'}, url: '/sessions', method: 'PUT'};
			authenticate(req, {}, function () {
				users.putUsers(req, res);
			});
		});

		it('Should update the user : lastname', function(done){
			var res = {
				status: function(code) {
					assert.equal(code, 200);
					return res;
				},
				json: function (data) {
					assert.equal(1, data.rowCount);
					assert.equal('goooorge', data.rows[0].lastname);
					done();
				}
			};
			var req = { headers: {sessionId: sessionId}, body: {lastname: 'goooorge'}, url: '/sessions', method: 'PUT'};
			authenticate(req, {}, function () {
				users.putUsers(req, res);
			});
		});

		it('Should update the user : email', function(done){
			var res = {
				status: function(code) {
					assert.equal(code, 200);
					return res;
				},
				json: function (data) {
					assert.equal(1, data.rowCount);
					assert.equal('coucou@coucou.com', data.rows[0].email);
					user.email = 'coucou@coucou.com';
					done();
				}
			};
			var req = { headers: {sessionId: sessionId}, body: {email: 'coucou@coucou.com'}, url: '/sessions', method: 'PUT'};
			authenticate(req, {}, function () {
				users.putUsers(req, res);
			});
		});

		it('Should update the user : password', function(done){
			var res = {
				status: function(code) {
					assert.equal(code, 200);
					return res;
				},
				json: function (data) {
					assert.equal(1, data.rowCount);
					assert.equal('goooorge', data.rows[0].password);
					done();
				}
			};
			var req = { headers: {sessionId: sessionId}, body: {password: 'goooorge'}, url: '/sessions', method: 'PUT'};
			authenticate(req, {}, function () {
				users.putUsers(req, res);
			});
		});

		it('Should update the user : firstname + lastname + password', function(done){
			var res = {
				status: function(code) {
					assert.equal(code, 200);
					return res;
				},
				json: function (data) {
					assert.equal(1, data.rowCount);
					assert.equal('bonjour', data.rows[0].firstname);
					assert.equal('goooorge', data.rows[0].lastname);
					assert.equal('gorge please"', data.rows[0].password);
					done();
				}
			};
			var req = { headers: {sessionId: sessionId}, body: {
				firstname: 'bonjour',
				lastname: 'goooorge',
				password: 'gorge please"'
			}, url: '/sessions', method: 'PUT'};
			authenticate(req, {}, function () {
				users.putUsers(req, res);
			});
		});
	});

	// PARTIE GET

	describe('Get Users Test', function () {

		it('Should get the user a@b.c', function(done) {

			var res = {
				status: function(code) {
					assert.equal(code, 200);
					return res;
				},
				json: function (data) {
					assert.equal("abcdefgh", data.rows[0].firstname);
					assert.equal("a@b.c", data.rows[0].email);
					done();
				}
			};
			var req = { params:{ id:userGet.id } };
			users.getUsers(req, res);
		});

		it('Should not get a user : not existing id', function(done) {

			var res = {
				status: function(code) {
					assert.equal(404, code);
					return res;
				},
				json: function (data) {
					assert.equal(data.message, "ERROR : Not existing user");
					done();
				}
			};
			var req = { params:{ id:-1 } };
			users.getUsers(req, res);
		});
	});

});