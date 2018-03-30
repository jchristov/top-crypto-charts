const https = require('https');
const database = require('./database.js');
const log = require('./log.js');
const binanceAPI = require('node-binance-api');

binanceAPI.options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
  useServerTime: true

});

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

exports.StartBinanceMarketStream = function() {

    binanceAPI.websockets.candlesticks(['BNBBTC'], "1m", (candlesticks) => {
        let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
        let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
        console.log(symbol+" "+interval+" candlestick update");
        console.log("open: "+open);
        console.log("high: "+high);
        console.log("low: "+low);
        console.log("close: "+close);
        console.log("volume: "+volume);
        console.log("isFinal: "+isFinal);
      });

}