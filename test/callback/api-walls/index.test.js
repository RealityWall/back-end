var assert = require('assert');
var walls = require('../../../modules/callback/api-walls');
var db = require('../../../modules/database');

describe ('Api-walls tests', function () {

	var wallId = null;

	before(function (doneBefore) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('INSERT INTO walls (latitude, longitude, address, address2, postal_code, city) '
                        + 'VALUES ($1, $2, $3, $4, $5, $6) '
                        + 'RETURNING *;', [0, 0, 'address One', 'adress Tow', '00000', 'TEST_CITY'])
                .then(function success (data) {
                	wallId = data.rows[0].id;
                    done();
                    doneBefore();
                });
        });
    });

    after(function (doneAfter) {
        db.connect(function success (client, done) {
            client
                .sqlQuery('DELETE FROM walls WHERE city=$1', ['TEST_CITY'])
                .then(function success (data) {
                    done();
                    doneAfter();
                });
        });
    });


	it('Should get the wall located at TEST_CITY', function(done) {
		var res = {
			status: function(code) {
				assert.equal(code, 200);
				return res;
			},
			json: function (data) {
				assert.equal("TEST_CITY", data.rows[0].city);
				assert.equal(1, data.rowCount);
				done();
			}
		};
		var req = { params: { id: wallId } };
		walls.getWalls(req, res);
	});

	it('Should not get the wall : not existing id', function(done) {

			var res = {
				status: function(code) {
					assert.equal(404, code);
					return res;
				},
				json: function (data) {
					assert.equal(data.message, "ERROR : Not existing wall");
					done();
				}
			};
			var req = { params:{ id:-1 } };
			walls.getWalls(req, res);
		});


});