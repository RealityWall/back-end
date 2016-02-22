'use strict';

let fs        = require("fs");
let path      = require("path");
let Sequelize = require("sequelize");
let POSTGRES = require('../../../constants.js').POSTGRES;
let sequelize = new Sequelize(
    'postgres://'
    + POSTGRES.USERNAME
    + ':' + POSTGRES.PASSWORD
    + '@' + POSTGRES.HOST
    + '/realitywall',
    {logging: false}
);
let db        = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        let model = sequelize.import(path.join(__dirname, file));
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
    let passwordCrypt = require('../password-crypt');
    return new Promise( (resolve, reject) => {
        db
            .Wall
            .bulkCreate([
                {address: 'address, 06560 Valbonne', latitude: 43.700000, longitude: 7.250000},
                {address: 'address, 06560 Valbonne', latitude: 43.6329, longitude: 6.9991},
                {address: 'address, 06600 Antibes', latitude: 43.5833, longitude: 7.1167}
            ])
            .then(() => {
                return passwordCrypt
                    .generate('password');
            })
            .then((password) => {
                return db
                    .User
                    .create({
                        email: 'admin@unmurdanslereel.fr',
                        password,
                        firstname: "admin",
                        lastname: "admin",
                        verified: true,
                        roles: ['admin']
                    })
            })
            .then(resolve)
            .catch(reject);
    });

};

module.exports = db;