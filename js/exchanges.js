const binance = require('./binance.js');
const bittrex = require('./bittrex.js');
const database = require('./database.js');
const influx = require('./influx.js');

// Set up automatic markets refresh
function refreshMarkets()
{
    x = 300;  // 5 Mins

    binance.BinanceMarketsRequest();
    bittrex.BittrexMarketsRequest();
    
    setTimeout(refreshMarkets, x*1000);
}

exports.initExchanges = function() {

    refreshMarkets();

    binance.StartBinanceMarketStream();
}

exports.getTopCoins = function(topCount, bases, exchanges, type, callback) {
    
    database.topCoinsQuery(topCount, bases, exchanges, type, callback);
}
var test = 0;

exports.getMarketChunk = function(exchange, time, callback) {
    
    influx.queryBinanceMarketData("BINANCE", time, callback);
}
