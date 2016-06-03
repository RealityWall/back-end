'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true
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
            defaultValue: null
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        facebookId: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        roles: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            validate: {
                correctInputs: (value) => {
                    const options = ["user", "admin", "organization", "messenger"];
                    const valid = value.some( (v) => { return options.indexOf(v) === -1; });
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
                User.hasMany(models.Session);
                User.hasMany(models.Post);
            }
        }
    });

    return User;
};