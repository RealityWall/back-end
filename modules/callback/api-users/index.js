var validator = require('../../validator');
var passwordCrypt = require('../../password-crypt');
var mailer = require('../../mailer');
var db = require('../../database');

module.exports = {

    /**
     * Récupération d'un user
     *
     *
     */
    getUsers: function(req, res){
        db.connect(function succes(client, done){
            client
                .sqlQuery(
                    'SELECT * FROM users WHERE id=$1',
                    [req.params.id])
                .then(function success (result) {
                    done();
                    return res.status(200).json(result);
                })
                .catch(function error (err) { res.status(500).json(err); });
        }, function error(err) { res.status(500),json({err}); });
    },

    /**
     * Inscription user
     * (FAIT) TODO : envoyer mail bienvenue
     * (FAIT) TODO : fichier non commité contenant les passwords importants
     */
    postUsers: function (req, res) {
        if(validator.userContentValidator(['email', 'password', 'firstname', 'lastname'], [], req, res)){
            db.connect(function success (client, done) {
                client
                    .sqlQuery(
                        'INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) '
                        + 'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) '
                        + 'RETURNING *;',
                        [req.body.email, passwordCrypt.generate(req.body.password), req.body.firstname, req.body.lastname])
                    .then(function success (result) {
                        //mailer working, but want to dodge spam
                        //mailer.send({to:req.body.email, object:"welcome to realityWall", text:"you are the welcome to realitywall app"});
                        done();
                        return res.status(201).json(result);
                    })
                    .catch(function error (err) { res.status(500).json(err); });
            }, function error (err) { res.status(500).json(err); });
        }
    },

    /**
     * Update user info
     * REQUIRE AUTH
     * req.headers.sessionId
     */
    putUsers: function (req, res) {

        if(validator.userContentValidator([], ['email', 'password', 'firstname', 'lastname'], req, res)) {
            var values = [];
            var request = '';
            var counter = 1;

            if(req.body.email) {
                values.push(req.body.email);
                request += 'email=$' + counter++ +  ',';
            }
            if (req.body.firstname) {
                values.push(req.body.firstname);
                request += 'firstname=$' + counter++ + ',';
            }
            if (req.body.lastname) {
                values.push(req.body.lastname);
                request += 'lastname=$' + counter++ + ',';
            }
            if (req.body.password) {
                values.push(req.body.password);
                request += 'password=$' + counter++ + ',';
            }

            if (request.length > 0) {
                // on ajoute l'id de l'utilisateur à la fin du tableau
                values.push(req.user.id);
                // on enlève la dernière virgule
                request = request.substr(0, request.length - 1);
                db.connect(function success (client, done) {
                    client
                        .sqlQuery(
                            'UPDATE users SET ' + request + ' '
                            + 'WHERE id=$' + counter++ + ' '
                            + 'RETURNING *;',
                            values
                        ).then(function success (result){
                            done();
                            return res.status(200).json(result);
                        })
                        .catch(function error(err){ res.status(500).json(err); });
                }, function error(err){ res.status(500).json(err); });
            } else {
                // empty put request
                return res.status(200).end();
            }

        }
    }

};