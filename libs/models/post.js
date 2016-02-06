'use strict';

module.exports = (sequelize, DataTypes) => {
    let Post = sequelize.define("Post", {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: (models) => {
                Post.belongsTo(models.Wall, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
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