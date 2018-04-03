const Influx = require('influx');

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'marketsdb',
    schema: [
      {
        measurement: 'binance_market_data',
        tags: [
          'coin',
          'quote',
          'exchange'
        ],
        fields: {
            open: Influx.FieldType.FLOAT,
            high: Influx.FieldType.FLOAT,
            low: Influx.FieldType.FLOAT,
            close: Influx.FieldType.FLOAT,
            volume: Influx.FieldType.FLOAT,
            volume_buy: Influx.FieldType.FLOAT,
            volume_ma: Influx.FieldType.FLOAT,
            volume_btc: Influx.FieldType.FLOAT
          }
      }
    ]
  })

  // Insertion

  exports.insertMarketData = function(coin, quote, exchange, open, high, low, close, volume, volume_buy, volume_ma, volume_btc) {

    influx.writePoints([
    {
        measurement: 'binance_market_data',
        tags: { 
            coin: coin,
            quote: quote,
            exchange: exchange
        },
        fields: { 
            open: open, 
            high: high,
            low: low,
            close: close,
            volume: volume,
            volume_buy: volume_buy,
            volume_ma: volume_ma,
            volume_btc: volume_btc
        }
    }
    ]).catch(err => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`)
    })
  }

// Query

exports.queryBinanceMarketData = function(exchange, time, callback) {

    influx.query(`
        SELECT 
            FIRST("open") as open,
            MAX("high") as high,
            MIN("low") as low,
            LAST("close") as close,
            SUM("volume") as volume,
            SUM("volume_buy") as volume_buy,
            SUM("volume_btc") as volume_btc,
            SUM("volume_ma") as volume_ma
        FROM 
            "binance_market_data"
        WHERE
            "time" > now()-${time}
        GROUP BY 
            "coin", "quote"
    `).then(result => {
        callback(result);
    }).catch(err => {
        console.log(err.stack);
    })
}

exports.init = function() {

    influx.getDatabaseNames()
    .then(names => {
        if (!names.includes('marketsdb')) {
            return influx.createDatabase('marketsdb');
        }
    })
    .then(() => {
        console.log("Influx started"); 
    })
    .catch(err => {
        console.error(`Error creating Influx database!`);
        console.log(err);
    })

  }