"use strict";

module.exports = function(sequelize, DataTypes) {
    let VerificationToken = sequelize.define("VerificationToken", {
        token: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                VerificationToken.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return VerificationToken;
};