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
    let _data = require('../data');
    let passwordCrypt = require('../password-crypt');
    return new Promise( (resolve, reject) => {
        let walls = [];
        db
            .Wall
            .bulkCreate(_data.walls)
            .then((wallInstances) => {
                walls = wallInstances;
                return passwordCrypt
                    .generate('password');
            })
            .then((password) => {
                return db
                    .User
                    .bulkCreate([
                        { email: 'admin@unmurdanslereel.fr',  password, firstname: "admin", lastname: "admin", verified: true, roles: ['admin'] },
                        { email: 'test1@unmurdanslereel.fr',  password, firstname: "test1", lastname: "user", verified: true, roles: ['user'] },
                        { email: 'test2@unmurdanslereel.fr',  password, firstname: "test2", lastname: "user", verified: true, roles: ['user'] }
                    ])
            })
            .then(() => {
                let posts = [];
                for (let i = 0; i < 200; i++) {
                    posts.push({
                        WallId: parseInt(Math.random() * 50) + 1,
                        UserId: parseInt(Math.random() * 2) + 2,
                        content: 'message created at initialization of the db'
                    })
                }
                return db
                    .Post
                    .bulkCreate(posts)
            })
            .then(() => {
                let pictures = [];
                for (let i = 0; i < 400; i++) {
                    let date = moment(new Date(2016, 4, i + 1));
                    pictures.push({
                        imagePath: 'wall.jpeg',
                        date,
                        WallId: parseInt(Math.random() * 50) + 1
                    });
                }
                return db
                    .Picture
                    .bulkCreate(pictures)
            })
            .then(resolve)
            .catch(reject);
    });

};

module.exports = db;