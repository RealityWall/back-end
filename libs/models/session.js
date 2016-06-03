"use strict";

module.exports = function(sequelize, DataTypes) {
    const Session = sequelize.define("Session", {
        sessionId: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Session.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Session;
};