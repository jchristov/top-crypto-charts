const binance = require('./binance.js');
const bittrex = require('./bittrex.js');
const database = require('./database.js');

// Set up automatic markets refresh
function refreshMarkets()
{
    x = 300;  // 5 Mins

    binance.BinanceMarketsRequest();
    bittrex.BittrexMarketsRequest();
    
    setTimeout(refreshMarkets, x*1000);
}

function refreshMarketChunks()
{
    x = 10;  // 10 Seconds

    database.updateMarketChunk('5m', 5);
    database.updateMarketChunk('15m', 15);
    database.updateMarketChunk('30m', 30);
    database.updateMarketChunk('1h', 60);
    database.updateMarketChunk('2h', 120);
    database.updateMarketChunk('4h', 240);
    database.updateMarketChunk('6h', 360);
    database.updateMarketChunk('12h', 720);
    //database.updateMarketChunk('1d', 1440);
    
    setTimeout(refreshMarketChunks, x*1000);
}

exports.initExchanges = function() {

    refreshMarkets();
    refreshMarketChunks();

    binance.StartBinanceMarketStream();
}

exports.getTopCoins = function(topCount, bases, exchanges, type, callback) {
    
    database.topCoinsQuery(topCount, bases, exchanges, type, callback);
}

exports.getMarketChunk = function(exchange, time, callback) {
    
    database.marketChunkQuery(exchange, time, callback);
}
