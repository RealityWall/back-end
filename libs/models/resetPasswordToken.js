"use strict";

module.exports = function(sequelize, DataTypes) {
    let ResetPasswordToken = sequelize.define("ResetPasswordToken", {
        token: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                ResetPasswordToken.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return ResetPasswordToken;
};