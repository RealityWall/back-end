var db = require('../database');
var logger = require('../logger');

var sessionsApi = require('./api-sessions');
var usersApi = require('./api-users');
var postsApi = require('./api-posts');

module.exports = {

    getSessions: sessionsApi.getSessions,
    postSessions: sessionsApi.postSessions,
    putSessions: sessionsApi.putSessions,
    deleteSessions: sessionsApi.deleteSessions,

    getUsers: usersApi.getUsers,
    postUsers: usersApi.postUsers,
    putUsers: usersApi.putUsers,

    postPosts: postsApi.postPosts,
    upOrDownPost: postsApi.upOrDownPost

};