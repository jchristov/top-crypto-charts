const https = require('https');
var database = require('./database.js');
var log = require('./log.js');
var sort = require('./sort.js');

exports.getSymbols = function(topCount, bases, exchanges, type, callback)
{

    database.query(topCount, bases, exchanges, type, callback);
}

function processBinanceMarkets(json)
{
    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        var symbol = obj["symbol"];
        var market = "";
        var base = "";
        var exchange = "BINANCE";
        var volume = parseFloat(obj["quoteVolume"]);
        var gain = parseFloat(obj["priceChangePercent"]);

        if("BTC" == symbol.substr(symbol.length - 3))
        {
            market = symbol.substr(0, symbol.length - 3);
            base = symbol.substr(symbol.length - 3);
        } else if ("ETH" == symbol.substr(symbol.length - 3))
        {
            market = symbol.substr(0, symbol.length - 3);
            base = symbol.substr(symbol.length - 3);
        } else if ("BNB" == symbol.substr(symbol.length - 3))
        {
            market = symbol.substr(0, symbol.length - 3);
            base = symbol.substr(symbol.length - 3);
        } else if ("USDT" == symbol.substr(symbol.length - 4))
        {
            market = symbol.substr(0, symbol.length - 4);
            base = symbol.substr(symbol.length - 4);
        }

        if(market != "" && base != "") // For some reason these are empty once on every binance api call. 
        {                               // Perhaps binance is returning an empty entry? Need to check.
            database.insert(market, base, exchange, volume, gain);
        }
    }

    //database.query(10, [['BTC']], [['BINANCE']], "G");
}

exports.BinanceMarketsRequest = function()
{
    // No third party module required: https is part of the Node.js API
    const url = "https://api.binance.com/api/v1/ticker/24hr";

    var getRequest = https.get(url, res => {

        log.log(`Refreshed Coins - statusCode:${res.statusCode}`);

        res.setEncoding("utf8");
        let body = "";

        res.on("data", data => {
            body += data;
        });

        res.on("end", () => {
            body = JSON.parse(body);
            processBinanceMarkets(body);
        });
    });

    getRequest.on('error', function (err) {

        log.log(err);
    });
}