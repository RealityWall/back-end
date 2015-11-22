var db = require('../../database');

module.exports = {

	getWalls: function(req, res) {
		db.connect(function success(client, done) {
            client
                .sqlQuery(
                    'SELECT * FROM walls WHERE id=$1;',
                    [req.params.id])
                .then(function success (result) {
                    done();
                    if(result.rowCount === 0) return res.status(404).json(new Error("ERROR : Not existing wall"));
                    return res.status(200).json(result.rows[0]);
                })
                .catch(function error (err) { console.log(err); res.status(500).json(err); });
        }, function error(err) { res.status(500).json(err); });
	},

    getPostsByWallId: function (req, res) {
       // TODO : implémenter getPostsByWallId
    }
};