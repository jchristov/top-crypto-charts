var express = require('express');
var app = express();
var path = require('path');
var database = require('./js/database.js');
var exchange = require('./js/exchanges.js');
var log = require('./js/log.js');

// Initialise database
database.init();

function createMCCLink(symbols)
{
    var link = "https://www.multicoincharts.com/?"
    for(var i = 0; i < symbols.length; i++)
    {
        link += "chart=BINANCE:";
        link += symbols[i].symbol;

        if(i != symbols.length-1)
            link += "&"
    }

    return link;
}

function createTradingViewLink(symbols)
{
    var link = ""
    for(var i = 0; i < symbols.length; i++)
    {
        link += "BINANCE:";
        link += symbols[i].symbol;

        if(i != symbols.length-1)
            link += ","
    }

    return link;
}

function validateParameters(numTopVolume, baseCoin, type, doSort)
{

   if (isNaN(numTopVolume) || numTopVolume <= 0)
       return false;

   if("BTC" != baseCoin && "ETH" != baseCoin && "BNB" != baseCoin && "USDT" != baseCoin)
       return false;

   if("V" != type && "G" != type)
       return false;

   if(doSort!= 0 && doSort != 1)
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

    console.log(`Count: ${count}`);
    console.log(`Coins: ${coins}`);
    console.log(`Exchanges: ${exchanges}`);
    console.log(`Type: ${type}`);

    //exchange.getSymbols(20, [['BTC']], [['BINANCE']], "G")
    exchange.getSymbols(count, [coins], [exchanges], type, function(result) {

        //console.log(result);
        //res.writeHead(200, { 'Content-Type': 'application/json'});

        res.json(result);
        //res.end(JSON.stringify(result));
        /*for(var i = 0; i < result.length; i++)
        {
            console.log(`Market: ${result[i].market}, Base: ${result[i].base}, Exchange: ${result[i].exchange}`);
        }*/
    });

    /*var numTopVolume = parseInt(req.query.count);
    var baseCoin = req.query.coin;
    var type = req.query.type;
    var doSort = parseInt(req.query.sort);

    if(!validateParameters(numTopVolume, baseCoin, type, doSort))
    {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-topCount:${numTopVolume},baseCoin:${baseCoin},type:${type},doSort:${doSort}`);
        res.send(500);
        return;
    }

    log.log(`Request at ip address ${req.ip} accepted. Params-topCount:${numTopVolume},baseCoin:${baseCoin},type:${type},doSort:${doSort}`);


    exchanges.getSymbols(20, [['BTC']], [['BINANCE']], "G")*/

    /*var symbols = exchanges.getSymbols(numTopVolume, baseCoin, type, doSort)
    var mccLink = createMCCLink(symbols);
    var tvLink = createTradingViewLink(symbols);

    res.json(
        {
            "mcc": mccLink,
            "tv": tvLink
        }
    );*/

    //return next();
 })
 
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var server = app.listen(port, ip, function () {
    var host = server.address().address
    var port = server.address().port

    log.log(`charts-generator app listening at http://${host}:${port}`);
})