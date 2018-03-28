var express = require('express');
var app = express();
var path = require('path');
var database = require('./js/database.js');
var exchange = require('./js/exchanges.js');
var log = require('./js/log.js');

// Initialise database
database.init();

function validateParameters(count, coins, exchanges, type)
{

   if (isNaN(count) || count <= 0)
       return false;

    for(var i = 0; i < coins.length; i++) {
        if("BTC" != coins[i] && "ETH" != coins[i] && "BNB" != coins[i] && "USDT" != coins[i])
            return false;
    }

    for(var i = 0; i < exchanges.length; i++) {
        if("BINANCE" != exchanges[i] && "BITTREX" != exchanges[i])
            return false;
    }

   if("V" != type && "G" != type)
       return false;

   return true;
}

function refreshBinanceMarkets()
{
    x = 60;  // 60 Seconds

    // Do your thing here
    exchange.BinanceMarketsRequest()

    setTimeout(refreshBinanceMarkets, x*1000);
}

refreshBinanceMarkets(); // execute function

// REST API

app.enable('trust proxy');

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
   });

app.get('/', function (req, res, next) {

    res.sendFile(path.join(__dirname + '/index.html'));

    log.log(`Index at ip address: ${req.ip}`)
 })

 app.get('/link', function (req, res, next) {

    if (!req.query.count || !req.query.coins || !req.query.exchanges || !req.query.type)
    {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-Params missing.`);
        res.send(500);
        return;
    }

    var count = parseInt(req.query.count);
    var coins = req.query.coins;
    var exchanges = req.query.exchanges;
    var type = req.query.type;

    if(!validateParameters(count, coins, exchanges, type)) {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-count:${count}, coins:${coins}, exchanges:${exchanges}, type:${type}.`);
        res.send(500);
        return;
    }

    log.log(`Request at ip address ${req.ip} accepted. Params-count:${count}, coins:${coins}, exchanges:${exchanges}, type:${type}.`);

    exchange.getSymbols(count, [coins], [exchanges], type, function(result) {
        res.json(result);
    });
 })
 
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var server = app.listen(port, ip, function () {
    var host = server.address().address
    var port = server.address().port

    log.log(`charts-generator app listening at http://${host}:${port}`);
})