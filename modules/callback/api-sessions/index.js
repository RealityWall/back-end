var db = require('../../database');
var passwordCrypt = require('../../password-crypt');
var uuid = require('node-uuid');

module.exports = {

    /**
     * Auth a user fby sessionId
     * @param req contains headers.sessionId
     * @param res
     */
    getSessions: function (req, res) {
        db.connect(function (client, done) {
            client
                .sqlQuery('SELECT * FROM users WHERE session_id=$1', [req.headers.sessionId])
                .then(function (data) {
                    done();
                    if (data.rows.length == 1) {
                        delete data.rows[0].password;
                        return res.status(200).json(data.rows[0]);
                    } else {
                        return res.status(404).json(new Error('Not Found'));
                    }
                })
                .catch(function (err) { res.status(500).json(err); });
        }, function error (err) { res.status(500).json(err); });
    },


    /**
     * Give a user a session
     * @param req
     * @param res
     */
    postSessions: function (req, res) {
        db.connect(function (client, done) {
            // SELECT user to know if he is in the database
            client
                .sqlQuery('SELECT * FROM users WHERE email=$1;', [req.body.email])
                .then(function (user) {
                    //console.log(user);
                    if (user.rows.length == 1) {
                        // password check
                        if (passwordCrypt.check(user.rows[0].password, req.body.password)) {
                            var newSession = uuid.v4();
                            // store the new session
                            client.
                                sqlQuery(
                                    'UPDATE users SET session_id=$1 WHERE email=$2;',
                                    [newSession, req.body.email]
                                )
                                .then(function () {
                                    done();
                                    return res.status(201).json({sessionId: newSession});
                                })
                                .catch(function (err) { res.status(500).json(err); });
                        } else {
                            return res.status(404).json(new Error('Bad Password'));
                        }
                    } else {
                        return res.status(404).json(new Error('User Not Found'));
                    }
                })
                .catch(function (err) { res.status(500).json(err); });
        }, function error (err) { res.status(500).json(err); });
    },

    /**
     * Give the user a new session
     * @param req
     * @param res
     */
    putSessions: function (req, res) {
        db.connect(function (client, done) {
            var newSession = uuid.v4();
            client
                .sqlQuery('UPDATE users SET session_id=$1 WHERE session_id=$2 RETURNING *;', [newSession, req.headers.sessionId])
                .then(function (data) {
                    done();
                    if (data.rows.length == 1) {
                        return res.status(202).json({sessionId: newSession});
                    } else {
                        return res.status(404).json(new Error('Not Found'));
                    }
                })
                .catch(function (err) { res.status(500).json(err); });
        }, function error (err) { errorCB(err, res); });
    },

    /**
     * Delete the session of a user
     * @param req
     * @param res
     */
    deleteSessions: function (req, res) {
        db.connect(function (client, done) {
            client
                .sqlQuery('UPDATE users SET session_id=NULL WHERE session_id=$1;', [req.user.session_id])
                .then(function () {
                    done();
                    return res.status(204).end();
                })
                .catch(function (err) { res.status(500).json(err); });
        }, function error (err) { res.status(500).json(err); });
    }
};