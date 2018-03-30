const https = require('https');
const database = require('./database.js');
const log = require('./log.js');

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