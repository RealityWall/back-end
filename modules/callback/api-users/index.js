var validator = require('../../validator');
var passwordCrypt = require('../../password-crypt');
var mailer = require('../../mailer');
var db = require('../../database');

module.exports = {
    /**
     * Inscription user
     * TODO : ENCRYPTER PASSWORD
     * TODO : envoyer mail bienvenue
     * TODO : fichier non commité contenant les passwords importants
     */
    postUsers: function (req, res) {
        if(validator.userContentValidator(req, res)){
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
                    .catch(function error (err) { errorCB(err, res); });
            }, function error (err) { errorCB(err, res); });
        }
    },

    /**
     * Update user info
     * REQUIRE AUTH
     * req.headers.sessionId
     */
    putUsers: function (req, res) {
        if(validator.userContentValidator(req, res)){            

            if(!req.body.newEmail)     req.body.newEmail = req.body.email;
            if(!req.body.newFirstname) req.body.newFirstname = req.body.firstname;
            if(!req.body.newLastname)  req.body.newLastname = req.body.lastname;
            if(!req.body.newPassword)  req.body.newPassword = req.body.password;

            db.connect(function success (client, done) {
                client
                    .sqlQuery('UPDATE users SET firstname=$1, lastname=$2, password=$3, email=$4'
                        + 'WHERE firstname=$5 AND lastname=$6 AND email=$7'
                        + 'RETURNING *;',
                        [req.body.newFirstname, req.body.newLastname, req.body.newPassword, req.body.newEmail
                        , req.body.firstname, req.body.lastname, req.body.email])
                    .then(function succes(result){
                        done();
                        return res.status(202).json(result);
                    })
                    .catch(function error(err){ errorCB(err, res) });
            }, function error(err){ errorCB(err, res) });
        }
    }

};