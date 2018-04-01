
var path = require('path');
var exchanges = require('./js/exchanges.js');
var log = require('./js/log.js');

function validateParameters(exchange, time)
{
    if(exchange != 'binance')
        return false;

    if(time != '5m' && time != '15m' && time != '30m' && time != '1h' && time != '2h' && time != '4h' && time != '6h' && time != '12hr')
        return false;
    return true;
}

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
    
    var ex = req.query.exchange;
    var time = req.query.time;
    
    if(!validateParameters(ex, time)) {
        log.log(`Request at ip address ${req.ip} denied. Invalid Params-exchange:${ex}, time:${time}.`);
        res.status(400).send('Params invalid');
        return;
    }
    
    log.log(`Request at ip address ${req.ip} accepted. Params-exchange:${ex}, time:${time}.`);
    


    exchanges.getMarketChunk(ex, time, function(result) {
        res.json(result);
    });
}