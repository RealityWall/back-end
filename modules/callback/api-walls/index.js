var db = require('../../database');

module.exports = {
	/*
	 * Récupération d'un wall
	 *
	 */
	getWalls: function(req, res){
		db.connect(function success(client, done){
            client
                .sqlQuery(
                    'SELECT * FROM walls WHERE id=$1;',
                    [req.params.id])
                .then(function success (result) {
                    if(result.rowCount === 0){
                        done();
                        return res.status(404).json(new Error("ERROR : Not existing wall"));
                    }
                    done();
                    return res.status(200).json(result);
                })
                .catch(function error (err) { console.log(err); res.status(500).json(err); });
        }, function error(err) { res.status(500),json({err}); });
	}
}
