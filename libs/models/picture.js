'use strict';

module.exports = (sequelize, DataTypes) => {
    const Picture = sequelize.define("Picture", {
        imagePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            unique: 'compositeIndex'
        }
    }, {
        classMethods: {
            associate: (models) => {
                Picture.belongsTo(models.Wall, {
                    unique: 'compositeIndex'
                });
            }
        }
    });
    return Picture;
};