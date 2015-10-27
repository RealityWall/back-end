var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var router = require('./modules/router')(express.Router());

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.use('/',router);

console.log("server launched");

var server = app.listen(1337);