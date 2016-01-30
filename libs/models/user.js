'use strict';

module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define("User", {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imagePath: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        roles: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            validate: {
                correctInputs: (value) => {
                    var options = ["user", "admin"];
                    var valid = value.some( (v) => { return options.indexOf(v) === -1; });
                    if (valid) {
                        throw new Error("Invalid input.");
                    } else {
                        return;
                    }
                }
            }
        }
    }, {
        classMethods: {
            associate: (models) => {
                User.hasMany(models.Session)
            }
        }
    });

    return User;
};