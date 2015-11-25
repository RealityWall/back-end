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
        // TODO : Add comments_rates
        db.connect(function success(client, done) {
            var params = [req.params.id];
            if (req.query.limit) params.push(req.query.limit);
            if (req.query.offset) params.push(req.query.offset);

            client
                .sqlQuery(
                    'SELECT p.id, p.title, p.content, p.created_at, p.user_id, p.wall_id, u.firstname, u.lastname, '
                    + 'coalesce(comments_count, 0) comments_count, '
                    + 'coalesce(likes_count, 0) likes_count, '
                    + 'coalesce(dislikes_count, 0) dislikes_count, '
                    + 'SUM(coalesce(comments_count, 0) + coalesce(likes_count, 0) + coalesce(dislikes_count, 0)) as score '
                    + 'FROM posts p '

                    + 'LEFT JOIN '
                    + '(SELECT c.post_id, count(1) comments_count '
                    + 'FROM comments c '
                    + 'GROUP BY c.post_id) as c '
                    + 'ON c.post_id=p.id '

                    + 'LEFT JOIN '
                    + '(SELECT r.post_id, count(1) likes_count '
                    + 'FROM posts_rates r '
                    + 'WHERE r.type=true '
                    + 'GROUP BY r.post_id) as r1 '
                    + 'ON r1.post_id=p.id '

                    + 'LEFT JOIN '
                    + '(SELECT r.post_id, count(1) dislikes_count '
                    + 'FROM posts_rates r '
                    + 'WHERE r.type=false '
                    + 'GROUP BY r.post_id) as r2 '
                    + 'ON r2.post_id=p.id '

                    + 'LEFT JOIN '
                    + '(SELECT id as confirmation_id, firstname, lastname '
                    + 'FROM users) as u '
                    + 'ON u.confirmation_id=p.user_id '

                    + 'WHERE p.wall_id=$1 '
                    + 'GROUP BY p.id, comments_count, likes_count, dislikes_count, u.firstname, u.lastname '
                    + 'ORDER BY (score) DESC '

                    + (req.query.limit ? 'LIMIT $2 ' : '')
                    + (req.query.offset ? 'OFFSET $3 ' : '')
                    + ';',
                    params)
                .then(function success (result) {
                    done();
                    return res.status(200).json(result.rows);
                })
                .catch(function error (err) { console.log(err); res.status(500).json(err); });
        }, function error(err) { res.status(500).json(err); });
    },

    getCommentsByPostId: function (req, res) {
        db.connect(function success(client, done) {
            if (req.query.order && req.query.order == 'time') {
                var params = [req.params.id];
                if (req.query.limit) params.push(req.query.limit);
                if (req.query.offset) params.push(req.query.offset);

                client
                    .sqlQuery(
                        'SELECT c.id, c.content, c.created_at, c.user_id, c.post_id, u.firstname, u.lastname, '
                        + 'coalesce(likes_count, 0) likes_count, '
                        + 'coalesce(dislikes_count, 0) dislikes_count '
                        + 'FROM comments c '

                        + 'LEFT JOIN '
                        + '(SELECT r.comment_id, count(1) likes_count '
                        + 'FROM comments_rates r '
                        + 'WHERE r.type=true '
                        + 'GROUP BY r.comment_id) as r1 '
                        + 'ON r1.comment_id=c.id '

                        + 'LEFT JOIN '
                        + '(SELECT r.comment_id, count(1) dislikes_count '
                        + 'FROM comments_rates r '
                        + 'WHERE r.type=false '
                        + 'GROUP BY r.comment_id) as r2 '
                        + 'ON r2.comment_id=c.id '

                        + 'LEFT JOIN '
                        + '(SELECT id as confirmation_id, firstname, lastname '
                        + 'FROM users) as u '
                        + 'ON u.confirmation_id=c.user_id '

                        + 'WHERE c.post_id=$1 '
                        + 'ORDER BY (c.created_at) DESC '
                        + (req.query.limit ? 'LIMIT $2 ' : '')
                        + (req.query.offset ? 'OFFSET $3 ' : '')
                        + ';',
                        params
                    ).then(function success (result) {
                        done();
                        return res.status(200).json(result.rows);
                    })
                    .catch(function error (err) { console.log(err); res.status(500).json(err); });
            } else {
                var params = [req.params.id];
                if (req.query.limit) params.push(req.query.limit);
                if (req.query.offset) params.push(req.query.offset);

                client
                    .sqlQuery(
                        'SELECT c.id, c.content, c.created_at, c.user_id, c.post_id, u.firstname, u.lastname, '
                        + 'coalesce(likes_count, 0) likes_count, '
                        + 'coalesce(dislikes_count, 0) dislikes_count, '
                        + 'SUM(coalesce(likes_count, 0) + coalesce(dislikes_count, 0)) as score '
                        + 'FROM comments c '

                        + 'LEFT JOIN '
                        + '(SELECT r.comment_id, count(1) likes_count '
                        + 'FROM comments_rates r '
                        + 'WHERE r.type=true '
                        + 'GROUP BY r.comment_id) as r1 '
                        + 'ON r1.comment_id=c.id '

                        + 'LEFT JOIN '
                        + '(SELECT r.comment_id, count(1) dislikes_count '
                        + 'FROM comments_rates r '
                        + 'WHERE r.type=false '
                        + 'GROUP BY r.comment_id) as r2 '
                        + 'ON r2.comment_id=c.id '

                        + 'LEFT JOIN '
                        + '(SELECT id as confirmation_id, firstname, lastname '
                        + 'FROM users) as u '
                        + 'ON u.confirmation_id=c.user_id '

                        + 'WHERE c.post_id=$1 '
                        + 'GROUP BY c.id, likes_count, dislikes_count, u.firstname, u.lastname '
                        + 'ORDER BY (score) DESC '

                        + (req.query.limit ? 'LIMIT $2 ' : '')
                        + (req.query.offset ? 'OFFSET $3 ' : '')
                        + ';',
                        params
                    ).then(function success (result) {
                        done();
                        return res.status(200).json(result.rows);
                    })
                    .catch(function error (err) { console.log(err); res.status(500).json(err); });
            }

        }, function error(err) { res.status(500).json(err); });
    }

};