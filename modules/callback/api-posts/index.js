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
                        })
                        .catch(function (err) { res.status(500).json(err); });
                }, function error (err) { res.status(500).json(err); });
            }
        }

    }

};