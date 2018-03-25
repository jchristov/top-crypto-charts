var express = require('express');
const https = require('https');
var app = express();
var path = require('path');

var all_symbols = []

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

function getByBase(key, array){
    for (var i=0; i < array.length; i++) {
        if (array[i].base === key) {
            return array[i];
        }
    }
}

function getSymbols(topCount, base, doSort)
{
    var symbols = [];

    var tempSymbols = getByBase(base, all_symbols)
    if (topCount < tempSymbols.markets.length)
        symbols = tempSymbols.markets.slice(0, topCount);
    else
        symbols = tempSymbols.markets;

    if (doSort == 1)
    {
        symbols = symbols.sort(compareBySymbol);
    }

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

        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);

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
    btc_symbols = []
    eth_symbols = []
    bnb_symbols = []
    usdt_symbols = []

    for(var i = 0; i < json.length; i++) {
        var obj = json[i];

        var symbol = obj["symbol"];
        var volume = parseFloat(obj["quoteVolume"]);

        if("BTC" == symbol.substr(symbol.length - 3))
        {
            btc_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        } else if ("ETH" == symbol.substr(symbol.length - 3))
        {
            eth_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        } else if ("BNB" == symbol.substr(symbol.length - 3))
        {
            bnb_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        } else if ("USDT" == symbol.substr(symbol.length - 4))
        {
            usdt_symbols.push(
                {
                    symbol: symbol,
                    volume: volume
                }
            );
        }
    }

    btc_symbols = btc_symbols.sort(compareByVolume);
    eth_symbols = eth_symbols.sort(compareByVolume);
    bnb_symbols = bnb_symbols.sort(compareByVolume);
    usdt_symbols = usdt_symbols.sort(compareByVolume);
    
    temp_all_symbols.push(
        {
            base: "BTC",
            markets: btc_symbols
        },
        {
            base: "ETH",
            markets: eth_symbols
        },
        {
            base: "BNB",
            markets: bnb_symbols
        },
        {
            base: "USDT",
            markets: usdt_symbols
        },
    );

    all_symbols = temp_all_symbols;
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

    res.sendFile(path.join(__dirname + '/index.html'));
 })

 function validateParameters(numTopVolume, baseCoin, doSort)
 {

    if (isNaN(numTopVolume) || numTopVolume <= 0)
        return false;

    if("BTC" != baseCoin && "ETH" != baseCoin && "BNB" != baseCoin && "USDT" != baseCoin)
        return false;

    if(doSort!= 0 && doSort != 1)
        return false;

    return true;
 }

 app.get('/link', function (req, res, next) {

    if (!req.query.count || !req.query.coin || !req.query.sort)
    {
        res.send(500);
        return;
    }

    var numTopVolume = parseInt(req.query.count);
    var baseCoin = req.query.coin;
    var doSort = parseInt(req.query.sort);

    if(!validateParameters(numTopVolume, baseCoin, doSort))
    {
        res.send(500);
        return;
    }

    var symbols = getSymbols(numTopVolume, baseCoin, doSort)
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
 
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var server = app.listen(port, ip, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("charts-generator app listening at http://%s:%s", host, port)
})