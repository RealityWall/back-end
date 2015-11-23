var db = require('../database');
var logger = require('../logger');

var sessionsApi = require('./api-sessions');
var usersApi = require('./api-users');
var postsApi = require('./api-posts');
var wallsApi = require('./api-walls');

module.exports = {

    getSessions: sessionsApi.getSessions,
    postSessions: sessionsApi.postSessions,
    putSessions: sessionsApi.putSessions,
    deleteSessions: sessionsApi.deleteSessions,

    getUsers: usersApi.getUsers,
    postUsers: usersApi.postUsers,
    putUsers: usersApi.putUsers,

    getPosts: postsApi.getPosts,
    getPostsByWallId: postsApi.getPostsByWallId,
    postPosts: postsApi.postPosts,
    upOrDownPost: postsApi.upOrDownPost,
    postComments: postsApi.postComments,
    upOrDownComment: postsApi.upOrDownComment,

    getCommentsByPostId: postsApi.getCommentsByPostId,


    getWalls: wallsApi.getWalls

};