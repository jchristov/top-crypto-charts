
var path = require('path');
var exchange = require('./js/exchanges.js');
var log = require('./js/log.js');

exports.html = function(req, res, next) {

    res.sendFile(path.join(__dirname + '/public/page/live.html'));
    log.log(`Live page: ip address: ${req.ip}`)
}

exports.data = function(req, res, next) {

    if (!req.query.exchange || !req.query.time)
    {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-Params missing.`);
        res.status(400).send('Params missing');
        return;
    }
    
    var exchange = req.query.exchange;
    var time = req.query.time;
    
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