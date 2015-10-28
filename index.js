// some viariable to initialize the server
var express = require('express');
var app = express();


// create the router with the bdd uniq instance
var router = require('./modules/router')(express.Router());

// module pour parser du json dans le body des requetes POST et PUT
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

// apply router to our app
app.use('/',router);

console.log("Server Launched on port 1111...");

// listen on port 1111
app.listen(1111);