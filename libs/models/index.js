'use strict';

const moment = require('moment');
const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");
const POSTGRES  = require('../../../constants.js').POSTGRES;
const sequelize = new Sequelize(
    'postgres://'
    + POSTGRES.USERNAME
    + ':' + POSTGRES.PASSWORD
    + '@' + POSTGRES.HOST
    + '/realitywall',
    {logging: false}
);
const db        = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.initialize = () => {
    return Promise.resolve();

};

module.exports = db;