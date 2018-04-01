var express = require('express');
var app = express();
var path = require('path');
var database = require('./js/database.js');
var log = require('./js/log.js');
var home = require('./home');
var live = require('./live');

// Initialise database
database.init();

// REST API

app.enable('trust proxy');

// For public files
app.use(express.static(__dirname + '/public'));

app.use(function(error, request, response, next) {
    log.log("Error handler: " + error);
    response.status(500).json({error:error.message});
});

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', home.html);
app.get('/home', home.html);
app.get('/home/data', home.data);

app.get('/live', live.html);
app.get('/live/data', live.html);
 
var port = process.env.TOP_CRYPTO_CHARTS_PORT || 8080;
var ip   = process.env.TOP_CRYPTO_CHARTS_IP  || '0.0.0.0';

var server = app.listen(port, ip, function () {
    var host = server.address().address
    var port = server.address().port

    log.log(`charts-generator app listening at http://${host}:${port}`);
})
