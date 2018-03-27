const https = require('https');
var log = require('./log.js');
var sort = require('./sort.js');

var all_vol_symbols = []
var all_gain_symbols = []

exports.getSymbols2 = function(bases, type)
{
    var symbols = [];

    for(var i = 0; i < bases.length; i++)
    {
        if(type == "V")
            symbols.push(sort.getByBase(bases[i], all_vol_symbols).markets);
        else if(type == "G")
            symbols.push(sort.getByBase(base[i], all_gain_symbols).markets);
    }

    return symbols;
}

exports.getSymbols = function(topCount, base, type, doSort)
{
    var symbols = [];

    if(type == "V")
        symbols = sort.getByBase(base, all_vol_symbols);
    else if(type == "G")
        symbols = sort.getByBase(base, all_gain_symbols)

    if (topCount < symbols.markets.length)
        symbols = symbols.markets.slice(0, topCount);
    else
        symbols = symbols.markets;

    if (doSort == 1)
    {
        symbols = symbols.sort(sort.compareBySymbol);
    }

    return symbols;
}

function processBinanceMarkets(json)
{
    var temp_vol_symbols = [];
    var temp_gain_symbols = [];
    var btc_symbols = [];
    var eth_symbols = [];
    var bnb_symbols = [];
    var usdt_symbols = [];

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        var symbol = obj["symbol"];
        var volume = parseFloat(obj["quoteVolume"]);
        var gain = parseFloat(obj["priceChangePercent"]);

        if("BTC" == symbol.substr(symbol.length - 3))
        {
            btc_symbols.push(
                {
                    symbol: symbol,
                    volume: volume,
                    gain: gain
                }
            );
        } else if ("ETH" == symbol.substr(symbol.length - 3))
        {
            eth_symbols.push(
                {
                    symbol: symbol,
                    volume: volume,
                    gain: gain
                }
            );
        } else if ("BNB" == symbol.substr(symbol.length - 3))
        {
            bnb_symbols.push(
                {
                    symbol: symbol,
                    volume: volume,
                    gain: gain
                }
            );
        } else if ("USDT" == symbol.substr(symbol.length - 4))
        {
            usdt_symbols.push(
                {
                    symbol: symbol,
                    volume: volume,
                    gain: gain
                }
            );
        }
    }

    var btc_vol_symbols = btc_symbols.sort(sort.compareByVolume).slice();
    var eth_vol_symbols = eth_symbols.sort(sort.compareByVolume).slice();
    var bnb_vol_symbols = bnb_symbols.sort(sort.compareByVolume).slice();
    var usdt_vol_symbols = usdt_symbols.sort(sort.compareByVolume).slice();

    temp_vol_symbols.push(
        {
            base: "BTC",
            markets: btc_vol_symbols
        },
        {
            base: "ETH",
            markets: eth_vol_symbols
        },
        {
            base: "BNB",
            markets: bnb_vol_symbols
        },
        {
            base: "USDT",
            markets: usdt_vol_symbols
        },
    );
    
    var btc_gain_symbols = btc_symbols.sort(sort.compareByGain).slice();
    var eth_gain_symbols = eth_symbols.sort(sort.compareByGain).slice();
    var bnb_gain_symbols = bnb_symbols.sort(sort.compareByGain).slice();
    var usdt_gain_symbols = usdt_symbols.sort(sort.compareByGain).slice();
    
    temp_gain_symbols.push(
        {
            base: "BTC",
            markets: btc_gain_symbols
        },
        {
            base: "ETH",
            markets: eth_gain_symbols
        },
        {
            base: "BNB",
            markets: bnb_gain_symbols
        },
        {
            base: "USDT",
            markets: usdt_gain_symbols
        },
    );

    all_vol_symbols = temp_vol_symbols;    
    all_gain_symbols = temp_gain_symbols;
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