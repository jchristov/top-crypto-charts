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
    //x = 10;  // 10 Seconds

    /*database.updateMarketChunk('5m', 5);
    database.updateMarketChunk('15m', 15);
    database.updateMarketChunk('30m', 30);
    database.updateMarketChunk('1h', 60);
    database.updateMarketChunk('2h', 120);
    database.updateMarketChunk('4h', 240);
    database.updateMarketChunk('6h', 360);
    database.updateMarketChunk('12h', 720);
    database.updateMarketChunk('1d', 1440);*/
    
    //setTimeout(refreshMarketChunks, x*1000);
}

exports.initExchanges = function() {

    refreshMarkets();
    //refreshMarketChunks();

    binance.StartBinanceMarketStream();
}

exports.getTopCoins = function(topCount, bases, exchanges, type, callback) {
    
    database.topCoinsQuery(topCount, bases, exchanges, type, callback);
}

exports.getMarketChunk = function(exchange, time, callback) {
    
    //database.marketChunkQuery(exchange, time, callback);
    var time2 = 0;
    if(time == '5m') {
        time2 = 5;
    } else if(time == '15m') {
        time2 = 15;
    } else if(time == '30m') {
        time2 = 30;
    } else if(time == '1h') {
        time2 = 60;
    } else if(time == '2h') {
        time2 = 120;
    } else if(time == '4h') {
        time2 = 240;
    } else if(time == '6h') {
        time2 = 360;
    } else if(time == '12h') {
        time2 = 720;
    } else if(time == '1d') {
        time2 = 1440;
    }
    console.log(time2);

    database.marketCandlesQuery(exchange, time2, callback);
}
