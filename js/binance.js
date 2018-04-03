const https = require('https');
const database = require('./database.js');
const influx = require('./influx.js');
const log = require('./log.js');
const binanceAPI = require('node-binance-api');

// Constants
const ONE_MIN_MIL = 60000;

binanceAPI.options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  useServerTime: true

});

var LATEST_BNBBTC_PRICE = 0.0;
var LATEST_ETHBTC_PRICE = 0.0;
var LATEST_USDTBTC_PRICE = 0.0;

function convertToBtc(symbol, value) {

    var last3 = symbol.substr(symbol.length - 3);

    var btcVal = 0.0;
    if ("BNB" == last3) {
        btcVal = value * LATEST_BNBBTC_PRICE;
    } else if("BTC" == last3){
        btcVal = value;
    } else if ("ETH" == last3) {
        btcVal = value * LATEST_ETHBTC_PRICE;
    } else if ("USDT" == symbol.substr(symbol.length - 4)) {
        btcVal = value / LATEST_USDTBTC_PRICE;
        if (!isFinite(btcVal)) {
            btcVal = 0.0
        }
    }
    return btcVal;
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
        var btcVolume = 0.0;
        var gain = parseFloat(obj["priceChangePercent"]);
        var low = parseFloat(obj["lowPrice"]);
        var high = parseFloat(obj["highPrice"]);
        var volatility = (high-low)/low*100.0;

        var last3 = symbol.substr(symbol.length - 3);
        if("BTC" == last3 || "ETH" == last3 || "BNB" == last3)
        {
            market = symbol.substr(0, symbol.length - 3);
            base = last3;
        } else if ("USDT" == symbol.substr(symbol.length - 4))
        {
            market = symbol.substr(0, symbol.length - 4);
            base = symbol.substr(symbol.length - 4);
        }

        btcVolume = convertToBtc(symbol, volume);

        if(market != "" && base != "") // For some reason these are empty once on every binance api call. 
        {                               // Perhaps binance is returning an empty entry? Need to check.
            database.marketsInsert(market, base, exchange, volume, btcVolume, gain, volatility);
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

exports.StartBinanceMarketStream = function() {

    binanceAPI.websockets.candlesticks(['BNBBTC', 'ETHBTC', 'BTCUSDT'], "1m", (candlesticks) => {
        let { s:symbol, k:ticks } = candlesticks;
        let { c:close} = ticks;

        if(symbol == 'BNBBTC') {
            LATEST_BNBBTC_PRICE = close;
        } else if(symbol == 'ETHBTC') {
            LATEST_ETHBTC_PRICE = close;
        } else if(symbol == 'BTCUSDT') {
            LATEST_USDTBTC_PRICE = close;
        }
    });

    binanceAPI.prevDay(false, (error, prevDay) => {
        let markets = [];
        for ( let obj of prevDay ) {
            let symbol = obj.symbol;

            markets.push(symbol);
        }
        binanceAPI.websockets.candlesticks(markets, '1m', (candlesticks) => {
            
            let { s:symbol, k:ticks } = candlesticks;
            let { o:open, h:high, l:low, c:close, q:volume, x:isFinal, q:quoteVolume, V:buyVolume } = ticks;
            
            if(symbol == '123456')
                return;

            if(!isFinal)
                return;
    
            var btcVolume = convertToBtc(symbol, volume);

            var coin = "";
            var query = "";
            var last3 = symbol.substr(symbol.length - 3);
            if("BTC" == last3 || "ETH" == last3 || "BNB" == last3)
            {
                coin = symbol.substr(0, symbol.length - 3);
                query = last3;
            } else if ("USDT" == symbol.substr(symbol.length - 4))
            {
                coin = symbol.substr(0, symbol.length - 4);
                query = symbol.substr(symbol.length - 4);
            }

            if(isFinal) {
                influx.insertMarketData(coin, query, 'BINANCE', 
                                        parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(close), 
                                        parseFloat(volume), parseFloat(buyVolume), 0.0, parseFloat(btcVolume));
            }
        });
    });
}