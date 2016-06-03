'use strict';

const models = require('../../models');
const Wall = models.Wall;
const Picture = models.Picture;
const errorHandler = require('../../error-handler');

module.exports = {

    'get': (req, res) => {
        Wall
            .findAll({})
            .then((walls) => {
                res.status(200).json(walls);
            })
            .catch((err) => {
                console.log(err);
                errorHandler.internalError(res)(err)
            });
    },

    post(req, res) {

        req.sanitizeBody('address').trim();

        req.checkBody('address', 'missing parameter : address').notEmpty();
        req.checkBody('latitude', 'missing or wrong parameter : latitude').isFloat({min: -90, max: 90});
        req.checkBody('longitude', 'missing or wrong parameter : longitude').isFloat({min: -180, max: 180});

        const errors = req.validationErrors();
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
    },

    getById(req, res) {

        req.checkParams('wallId', 'wallId must be an integer').isInt();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        Wall
            .findOne({
                where: {
                    id: req.params.wallId
                },
                include: [
                    { model: Picture }
                ]
            })
            .then((wallInstance) => {
                if (wallInstance) {
                    res.status(200).json(wallInstance);
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res));
    },

    deleteById(req, res) {

        req.checkParams('wallId', 'wallId must be an integer').isInt();

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        Wall
            .destroy({
                where: {
                    id: req.params.wallId
                }
            })
            .then((nbDestroyed) => {
                if (nbDestroyed === 1) {
                    res.status(204).end();
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res))
    },

    putById(req, res) {

        req.checkParams('wallId', 'wallId must be an integer').isInt();

        const updateQuery = {};

        if (req.body.address) {
            req.sanitizeBody('address').trim();
            updateQuery.address = req.body.address;
            req.checkBody('address', 'missing parameter : address').notEmpty();
        }
        if (req.body.latitude) {
            updateQuery.latitude = req.body.latitude;
            req.checkBody('latitude', 'missing or wrong parameter : latitude').isFloat({min: -90, max: 90});
        }
        if (req.body.longitude) {
            updateQuery.longitude = req.body.longitude;
            req.checkBody('longitude', 'missing or wrong parameter : longitude').isFloat({min: -180, max: 180});
        }

        if (!req.body.address && !req.body.latitude && !req.body.longitude) {
            return res.status(200).end();
        }

        const errors = req.validationErrors();
        if (errors) return res.status(400).json(errors);

        Wall
            .update(
                updateQuery,
                { where: { id: req.params.wallId } }
            )
            .then((affectedRows) => {
                if (affectedRows.length === 1 && affectedRows[0] === 1) {
                    res.status(200).end();
                } else {
                    res.status(404).end();
                }
            })
            .catch(errorHandler.internalError(res));

    }

};