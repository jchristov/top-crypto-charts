const binance = require('./binance.js');
const bittrex = require('./bittrex.js');
const database = require('./database.js');

exports.getSymbols = function(topCount, bases, exchanges, type, callback) {
    
    database.query(topCount, bases, exchanges, type, callback);
}

exports.refreshMarkets = function() {

    binance.BinanceMarketsRequest();
    bittrex.BittrexMarketsRequest();
}
