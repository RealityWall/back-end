var db = require('../../database');
var validator = require('../../validator');

module.exports = {

    postPosts: function (req, res) {
        if(validator.userContentValidator(['content', 'wall_id'], ['title', 'post_id'], req, res)) {
            if (req.body.title && req.body.post_id) {
                res.status(400).json(new Error('cannot have a title and a post_id'));
             } else {
                db.connect(function (client, done) {
                    client
                        .sqlQuery(
                            'INSERT INTO posts (title, content, created_at, user_id, wall_id, post_id) ' +
                            'VALUES ($1, $2, current_timestamp, $3, $4, $5) ' +
                            'RETURNING *',
                            [req.body.title, req.body.content, req.user.id, req.body.wall_id, req.body.post_id]
                        ).then(function (data) {
                            done();
                            if (data.rows.length == 1) {
                                return res.status(201).json(data.rows[0]);
                            } else {
                                return res.status(201).end();
                            }
                        }).catch(function (err) { res.status(500).json(err); });
                }, function error (err) { res.status(500).json(err); });
            }
        }
    },

    upOrDownPost: function (req, res) {
        db.connect(function (client, done) {
            client
                .sqlQuery(
                    'INSERT INTO rates (post_id, user_id, type) ' +
                    'VALUES ($1, $2, $3) ' +
                    'RETURNING *',
                    [req.params.id, req.user.id, req.url.indexOf('/like') >= 0]
                ).then(function () {
                    done();
                    return res.status(201).end();
                }).catch(function (err) {
                    // depend of the error
                    if (err.code == '23505' && err.table == 'rates' && err.constraint == 'rates_pkey') {
                        db.connect(function (client, done) {
                            client
                                .sqlQuery(
                                    'UPDATE rates SET type=$1 WHERE post_id=$2 AND user_id=$3',
                                    [req.url.indexOf('/like') >= 0, req.params.id, req.user.id]
                                ).then(function () {
                                    done();
                                    return res.status(201).end();
                                })
                                .catch(function (err) {
                                    res.status(500).json(err);
                                });
                        }, function error (err) { res.status(500).json(err); });
                    } else {
                        res.status(500).json(err);
                    }
                });
        }, function error (err) { res.status(500).json(err); });
    }

};