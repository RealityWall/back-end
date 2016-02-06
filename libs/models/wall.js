'use strict';

module.exports = (sequelize, DataTypes) => {
    let Wall = sequelize.define("Wall", {
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: { min: -90, max: 90 }
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: { min: -180, max: 180 }
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false
        }
    }, {
        classMethods: {
            associate: (models) => {
                Wall.hasMany(models.Post);
            }
        }
    });
    return Wall;
};