var validator = require('../../validator');
var bcrypt = require('../../password-crypt');
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
        if(!req.body.email){
            res.status(400).json(new Error("mail input empty"));
        } else if(!req.body.firstname){
            res.status(400).json(new Error("firtname input empty"));
        } else if(!req.body.lastname){
            res.status(400).json(new Error("lastname input empty"));
        } else if(!validator.mailValidator(req.body.email)){
            res.status(400).json(new Error("bad mail format"));
        } else if(req.body.firstname.length < 1 || req.body.firstname.length > 100){
            res.status(400).json(new Error("firstname size must be between 1 and 100"));
        } else if(req.body.lastname.length < 1 || req.body.lastname.length > 100){
            res.status(400).json(new Error("lastname size must be between 1 and 100"));
        } else if(req.body.password.length < 7 || req.body.password.length > 30){
            res.status(400).json(new Error("password size must be between 7 and 30"));
        } else{
            db.connect(function success (client, done) {
                client
                    .sqlQuery(
                        'INSERT INTO users (email, password, firstname, lastname, created_at, updated_at) '
                        + 'VALUES ($1, $2, $3, $4, current_timestamp, current_timestamp) '
                        + 'RETURNING *;',
                        [req.body.email, bcrypt.generate(req.body.password), req.body.firstname, req.body.lastname])
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
     * Modify user
     * REQUIRE AUTH
     * req.sessionId
     */
    putUsers: function () {
        
    }
};