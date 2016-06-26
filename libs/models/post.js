'use strict';

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        hasBeenDisplayed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        classMethods: {
            associate: (models) => {
                Post.belongsTo(models.User, {
                    onDelete: "SET NULL",
                    foreignKey: {
                        allowNull: true
                    }
                })
            }
        }
    });
    return Post;
};