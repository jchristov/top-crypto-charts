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
    
    influx.queryBinanceMarketData("BINANCE", time, function(result) {

        var data = {"data": []};

        for (var i in result) {

            var coin = result[i].coin;
            if(coin != undefined) {

                var gain = (result[i].close - result[i].open) / result[i].open * 100.0;
                var volatility = (result[i].high - result[i].low) / result[i].low * 100.0;

                /*data.data.push([
                    "BINANCE:"+coin+result[i].quote,
                    coin,
                    result[i].quote,
                    gain,
                    volatility,
                    result[i].volume,
                    result[i].volume_btc
                ]);*/

                data.data.push({
                    "symbol": "BINANCE:"+coin+result[i].quote,
                    "coin": coin,
                    "quote": result[i].quote,
                    "gain": gain,
                    "volatility": volatility,
                    "volume": result[i].volume,
                    "volume_btc": result[i].volume_btc
                });
            }
        }

        callback(data);

    });
}
