'use strict';

let models = require('../models');
let Session = models.Session;
let User = models.User;

module.exports = {

    isInRole: function (roles) {

        return function (req, res, next) {
            if (req.headers && req.headers.sessionid) {
                Session
                    .findOne({
                        where: {
                            sessionId: req.headers.sessionid
                        },
                        include: [ User ]
                    })
                    .then( (sessionInstance) => {
                        if (sessionInstance) {
                            for (let i = 0; i < roles.length; i++) {
                                if (sessionInstance.User.roles.indexOf(roles[i]) >= 0) {
                                    next();
                                    return;
                                }
                            }
                            res.status(403).end();
                        } else {
                            res.status(404).end();
                        }
                    })
                    .catch( (error) => {
                        res.status(500).json(error);
                    })
            } else {
                res.status(400).json(new Error('Your request must contain a sessionid in headers'));
            }

        }

    }

};