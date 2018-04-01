
var path = require('path');
var exchange = require('./js/exchanges.js');
var log = require('./js/log.js');

function validateParameters(count, coins, exchanges, type)
{

   if (isNaN(count) || count <= 0)
       return false;

    for(var i = 0; i < coins.length; i++) {
        if("BTC" != coins[i] && "ETH" != coins[i] && "BNB" != coins[i] && "USDT" != coins[i])
            return false;
    }

    for(var i = 0; i < exchanges.length; i++) {
        if("BINANCE" != exchanges[i] && "BITTREX" != exchanges[i])
            return false;
    }

    if (isNaN(type) || !(type >= 0 && type <= 2))
       return false;

   return true;
}

exports.html = function(req, res, next) {

    res.sendFile(path.join(__dirname + '/public/page/index.html'));
    log.log(`Home page: ip address: ${req.ip}`)
}

exports.data = function(req, res, next) {

    if (!req.query.count || !req.query.coins || !req.query.exchanges || !req.query.type) {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-Params missing.`);
        res.status(400).send('Params missing');
        return;
    }
    
    var count = parseInt(req.query.count);
    var coins = req.query.coins;
    var exchanges = req.query.exchanges;
    var type = parseInt(req.query.type);
    
    if(!validateParameters(count, coins, exchanges, type)) {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-count:${count}, coins:${coins}, exchanges:${exchanges}, type:${type}.`);
        res.status(400).send('Params invalid');
        return;
    }
    
    log.log(`Request at ip address ${req.ip} accepted. Params-count:${count}, coins:${coins}, exchanges:${exchanges}, type:${type}.`);
    
    exchange.getSymbols(count, [coins], [exchanges], type, function(result) {
        res.json(result);
    });
}