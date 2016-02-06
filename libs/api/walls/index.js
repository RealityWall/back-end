'use strict';

let models = require('../../models');
let Wall = models.Wall;
let errorHandler = require('../../error-handler');

module.exports = {

    'get': (req, res) => {
        Wall
            .findAll({})
            .then((walls) => {
                res.status(200).json(walls);
            })
            .catch(errorHandler.internalError(res));
    },

    post(req, res) {

        req.sanitizeBody('address').trim();

        req.checkBody('address', 'missing parameter : address').notEmpty();
        req.checkBody('latitude', 'missing or wrong parameter : latitude').isFloat({min: -90, max: 90});
        req.checkBody('longitude', 'missing or wrong parameter : longitude').isFloat({min: -180, max: 180});

        let errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        Wall
            .create({
                address: req.body.address,
                longitude: req.body.longitude,
                latitude: req.body.latitude
            })
            .then((createdInstance) => {
                res.status(201).json(createdInstance);
            })
            .catch(errorHandler.internalError(res));
    }

};