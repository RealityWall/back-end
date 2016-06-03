'use strict';

const models = require('../models');
const Session = models.Session;
const User = models.User;

module.exports = {

    /**
     * Check if the user connected has the rights to invoke route
     *
     * @param roles the roles that are authorized for the route
     */
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
                            req.User = sessionInstance.User;
                            for (let i = 0; i < roles.length; i++) {
                                if (sessionInstance.User.roles.indexOf(roles[i]) >= 0) {
                                    next();
                                    return;
                                }
                            }
                            res.status(403).end();
                        } else {
                            res.status(401).json(new Error('SessionId NOT FOUND'));
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