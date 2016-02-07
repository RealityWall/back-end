'use strict';

module.exports = (sequelize, DataTypes) => {
    let Picture = sequelize.define("Picture", {
        imagePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: (models) => {
                Picture.belongsTo(models.Wall);
            }
        }
    });
    return Picture;
};