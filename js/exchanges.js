const https = require('https');
var database = require('./database.js');
var log = require('./log.js');
var sort = require('./sort.js');

exports.getSymbols = function(topCount, bases, exchanges, type, callback)
{

    database.query(topCount, bases, exchanges, type, callback);
}

// BINANCE

function processBinanceMarkets(json)
{

    // Get price of bases to help determine base price in btc for all markets
    var BNBBTC = 0.0;
    var ETHBTC = 0.0;
    var USDTBTC = 0.0;

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        if(obj['symbol'] == 'BNBBTC') {
            BNBBTC = obj['lastPrice'];
        } else if(obj['symbol'] == 'ETHBTC') {
            ETHBTC = obj['lastPrice'];
        } else if(obj['symbol'] == 'BTCUSDT') {
            USDTBTC = obj['lastPrice'];
        }
    }


    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        var symbol = obj["symbol"];
        var market = "";
        var base = "";
        var exchange = "BINANCE";
        var volume = parseFloat(obj["quoteVolume"]);
        var btcVolume = 0.0;
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

        if(base == "BNB") {
            btcVolume = volume * BNBBTC;
        } else if (base == "BTC") {
            btcVolume = volume;
        } else if (base == "ETH") {
            btcVolume = volume * ETHBTC;
        } else if (base == "USDT") {
            btcVolume = volume / USDTBTC;
        }

        if(market != "" && base != "") // For some reason these are empty once on every binance api call. 
        {                               // Perhaps binance is returning an empty entry? Need to check.
            database.insert(market, base, exchange, volume, btcVolume, gain);
        }
    }

    log.log(`Refreshed Binance Coins.`);
}

exports.BinanceMarketsRequest = function()
{
    // No third party module required: https is part of the Node.js API
    const url = "https://api.binance.com/api/v1/ticker/24hr";

    var getRequest = https.get(url, res => {

        log.log(`Refreshing Binance Coins - statusCode:${res.statusCode}.`);

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

// BITTREX

function processBittrexMarkets(json)
{

    // Get price of bases to help determine base price in btc for all markets
    var ETHBTC = 0.0;
    var USDTBTC = 0.0;

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        if(obj['MarketName'] == 'BTC-ETH') {
            ETHBTC = obj['Last'];
        } else if(obj['MarketName'] == 'USDT-BTC') {
            USDTBTC = obj['Last'];
        }
    }

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        var symbol = obj["MarketName"].split('-');
        var market = symbol[1];
        var base = symbol[0];
        var exchange = "BITTREX";
        var volume = parseFloat(obj["BaseVolume"]);
        var btcVolume = 0.0;
        var open = parseFloat(obj["PrevDay"]);
        var close = parseFloat(obj["Last"]);
        var gain = (close-open)/open*100.0;

        if (base == "BTC") {
            btcVolume = volume;
        } else if (base == "ETH") {
            btcVolume = volume * ETHBTC;
        } else if (base == "USDT") {
            btcVolume = volume / USDTBTC;
        }

        database.insert(market, base, exchange, volume, btcVolume, gain);
    }

    log.log(`Refreshed Bittrex Coins.`);
}

exports.BittrexMarketsRequest = function()
{
    // No third party module required: https is part of the Node.js API
    const url = "https://bittrex.com/api/v1.1/public/getmarketsummaries";

    var getRequest = https.get(url, res => {

        log.log(`Refreshing Bittrex Coins - statusCode:${res.statusCode}.`);

        res.setEncoding("utf8");
        let body = "";

        res.on("data", data => {
            body += data;
        });

        res.on("end", () => {
            body = JSON.parse(body);

            if(body['success']) {
                processBittrexMarkets(body['result']);
            } else {
                log.log(body['message']);
            }
            
        });
    });

    getRequest.on('error', function (err) {

        log.log(err);
    });
}