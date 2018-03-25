var express = require('express');
const https = require('https');
var app = express();

var all_symbols = []
var btc_symbols = []
var eth_symbols = []
var usdt_symbols = []

function compareBySymbol(a,b) {
    if (a.symbol < b.symbol)
      return -1;
    if (a.symbol > b.symbol)
      return 1;
    return 0;
}

function compareByVolume(a,b) {
    if (a.volume < b.volume)
      return 1;
    if (a.volume > b.volume)
      return -1;
    return 0;
}

function getSymbols(topCount)
{
    var symbols = [];
    if (topCount < btc_symbols.length)
        symbols = btc_symbols.slice(0, topCount);
    else
        symbols = btc_symbols;

    return symbols;
}

function createMCCLink(symbols)
{
    var link = "https://www.multicoincharts.com/?"
    for(var i = 0; i < symbols.length; i++)
    {
        link += "chart=";
        link += symbols[i].symbol;

        if(i != symbols.length-1)
            link += "&"
    }

    return link;
}

function createTradingViewLink(symbols)
{
    var link = ""
    for(var i = 0; i < symbols.length; i++)
    {
        link += "BINANCE:";
        link += symbols[i].symbol;

        if(i != symbols.length-1)
            link += ","
    }

    return link;
}

function BinanceMarketsRequest()
{
    // No third party module required: https is part of the Node.js API
    const url = "https://api.binance.com/api/v1/ticker/24hr";

    https.get(url, res => {

        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

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
}

function processBinanceMarkets(json)
{
    temp_all_symbols = []
    temp_btc_symbols = []
    temp_eth_symbols = []
    temp_usdt_symbols = []

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        var symbol = obj["symbol"];
        var volume = parseFloat(obj["quoteVolume"]);

        temp_all_symbols.push(
            {
                symbol: symbol,
                volume: volume
            }
        );

        if("BTC" == symbol.substr(symbol.length - 3))
        {
            temp_btc_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        } else if ("ETH" == symbol.substr(symbol.length - 3))
        {
            temp_eth_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        } else if ("USDT" == symbol.substr(symbol.length - 4))
        {
            temp_usdt_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        }
    }

    temp_all_symbols = temp_all_symbols.sort(compareByVolume);
    temp_btc_symbols = temp_btc_symbols.sort(compareByVolume);
    temp_eth_symbols = temp_eth_symbols.sort(compareByVolume);
    temp_usdt_symbols = temp_usdt_symbols.sort(compareByVolume);
    
    all_symbols = temp_all_symbols;
    btc_symbols = temp_btc_symbols;
    eth_symbols = temp_eth_symbols;
    usdt_symbols = temp_usdt_symbols;
}

/*function refreshBinanceMarkets()
{
    x = 5;  // 60 Seconds

    // Do your thing here
    BinanceMarketsRequest()

    setTimeout(refreshBinanceMarkets, x*1000);
}

refreshBinanceMarkets(); // execute function*/

BinanceMarketsRequest();


// REST API

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
   });

app.get('/', function (req, res, next) {

    if (!req.query.topCount)
    {
        res.send(500);
    }

    var numTopVolume = parseInt(req.query.topCount);

    var symbols = getSymbols(numTopVolume)
    var mccLink = createMCCLink(symbols);
    var tvLink = createTradingViewLink(symbols);

    res.json(
        {
            "mcc": mccLink,
            "tv": tvLink
        }
    );

    return next();
 })
 
 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })