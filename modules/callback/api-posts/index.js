var db = require('../../database');
var validator = require('../../validator');

module.exports = {

    getPosts: function (req, res) {
        db.connect(function success(client, done) {
            client
                .sqlQuery(
                'SELECT * FROM posts WHERE id=$1;',
                [req.params.id])
                .then(function success (result) {
                    done();
                    if(result.rowCount === 0) return res.status(404).json(new Error("ERROR : Not existing post"));
                    return res.status(200).json(result.rows[0]);
                })
                .catch(function error (err) { console.log(err); res.status(500).json(err); });
        }, function error(err) { res.status(500).json(err); });
    },

    postPosts: function (req, res) {
        if(validator.userContentValidator(['content', 'wall_id', 'title'], [], req, res)) {
            db.connect(function (client, done) {
                client
                    .sqlQuery(
                        'INSERT INTO posts (title, content, created_at, user_id, wall_id) ' +
                        'VALUES ($1, $2, current_timestamp, $3, $4) ' +
                        'RETURNING *',
                        [req.body.title, req.body.content, req.user.id, req.body.wall_id]
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
    },

    upOrDownPost: function (req, res) {
        db.connect(function (client, done) {
            client
                .sqlQuery(
                    'INSERT INTO posts_rates (post_id, user_id, type) ' +
                    'VALUES ($1, $2, $3) ' +
                    'RETURNING *',
                    [req.params.id, req.user.id, req.url.indexOf('/like') >= 0]
                ).then(function () {
                    done();
                    return res.status(201).end();
                }).catch(function (err) {
                    // depend of the error
                    if (err.code == '23505' && err.table == 'posts_rates' && err.constraint == 'posts_rates_pkey') {
                        db.connect(function (client, done) {
                            client
                                .sqlQuery(
                                    'UPDATE posts_rates SET type=$1 WHERE post_id=$2 AND user_id=$3',
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
    },

    postComments: function (req, res) {
        if(validator.userContentValidator(['content'], [], req, res)) {
            db.connect(function (client, done) {
                client
                    .sqlQuery(
                        'INSERT INTO comments (content, created_at, user_id, post_id) ' +
                        'VALUES ($1, current_timestamp, $2, $3) ' +
                        'RETURNING *',
                        [req.body.content, req.user.id, req.params.id]
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
    },

    upOrDownComment: function (req, res) {
        db.connect(function (client, done) {
            client
                .sqlQuery(
                'INSERT INTO comments_rates (comment_id, user_id, type) ' +
                'VALUES ($1, $2, $3) ' +
                'RETURNING *',
                [req.params.id, req.user.id, req.url.indexOf('/like') >= 0]
            ).then(function () {
                    done();
                    return res.status(201).end();
                }).catch(function (err) {
                    // depend of the error
                    if (err.code == '23505' && err.table == 'comments_rates' && err.constraint == 'comments_rates_pkey') {
                        db.connect(function (client, done) {
                            client
                                .sqlQuery(
                                    'UPDATE comments_rates SET type=$1 WHERE comment_id=$2 AND user_id=$3',
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
    },

    getPostsByWallId: function (req, res) {
        // TODO : test
        db.connect(function success(client, done) {
            client
                .sqlQuery(
                    'SELECT p.id, p.title, p.content, p.created_at, p.user_id, p.wall_id, '
                    + 'coalesce(comments_count, 0) comments_count, '
                    + 'coalesce(rates_count, 0) rates_count, '
                    + 'SUM(comments_count + rates_count) as score '
                    + 'FROM posts p '
                    + 'LEFT JOIN '
                    + '(SELECT c.post_id, count(1) comments_count '
                    + 'FROM comments c '
                    + 'GROUP BY c.post_id) as c '
                    + 'ON c.post_id=p.id '
                    + 'LEFT JOIN '
                    + '(SELECT r.post_id, count(1) rates_count '
                    + 'FROM posts_rates r '
                    + 'GROUP BY r.post_id) as r '
                    + 'ON r.post_id=p.id '
                    + 'WHERE p.wall_id=$1 '
                    + 'GROUP BY p.id, comments_count, rates_count '
                    + 'ORDER BY (score) DESC '
                    + (req.query.limit ? 'LIMIT $2 ' : '')
                    + (req.query.offset ? 'OFFSET $3 ' : '')
                    + ';',
                    [req.params.id, req.query.limit, req.query.offset])
                .then(function success (result) {
                    done();
                    return res.status(200).json(result.rows);
                })
                .catch(function error (err) { console.log(err); res.status(500).json(err); });
        }, function error(err) { res.status(500).json(err); });
    }

};