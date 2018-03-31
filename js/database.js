var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.MYSQL_SERVICE_HOST,
  port: process.env.MYSQL_SERVICE_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

// Three types of text are stored using the following assumptions
// VARCHAR(8) - Used for coin tokens (max length of 8 characters) ~ Token will never exceen this
// VARCHAR(16) - Used for exchanges (max length of 16 characters) ~ Token will never exceen this
// VARCHAR(32) - Used for symbols (max length of 33 characters) ~ Symbol will never exceen this
const LENGTH_TOKEN = 8;
const LENGTH_EXCHANGE = 16;
const LENGTH_SYMBOL = 33;
const CHAR_TOKEN = `VARCHAR(${LENGTH_TOKEN})`;
const CHAR_EXCHANGE = `VARCHAR(${LENGTH_EXCHANGE})`;
const CHAR_SYMBOL = `VARCHAR(${LENGTH_SYMBOL})`;

// Three types of numbers are stored using the following assumptions:
// NUMERIC(10,2) - Used for percentages (max: 99,999,999.99% | min: -99,999,999.98%) ~ Percentages will never exceed this
// NUMERIC(15,8) - Used for prices      (max: 9,999,999.99999999 | min: -9,999,999.99999998) ~ Prices will never exceed this
// NUMERIC(17,8) - Used for total volume  (max: 999,999,999.99999999 | min: -999,999,999.99999998) ~ Total volume will never exceed this
const NUM_PERCENT = "NUMERIC(10,2)";
const NUM_PRICE = "NUMERIC(15,8)";
const NUM_VOLUME = "NUMERIC(17,8)";

// Ints using the following assumptions.
// INT(10) - Used for unix time (32 bit) ~ Assuming we wont run into  the 'year 2038 problem'
const INT_TIME = "INT(10)";
const INV_1e2 = 1/1e2;
const INV_1e6 = 1/1e6;
const INV_1e8 = 1/1e8;

// Enums
const ENUM_INTERVAL = "ENUM('1m', '3m', '5m', '15m', '30m', '1h', '4h', '6h', '12h', '1d', '1w', '4w')";

// DB rounding misc

function roundString(value, maxLength) {
  if(value.length > maxLength)
    value = value.substr(0, maxLength);
  return value;
}

function roundPercent(value) {
  return Math.round( value * 1e2 ) * INV_1e2;
}

function roundPrice(value) {
  return Math.round( value * 1e8 ) * INV_1e8;
}

function roundVolume(value) {
  return Math.round( value * 1e8 ) * INV_1e8;
}

// DB insertions

exports.marketsInsert = function(market, base, exchange, volume, btcVolume, gain, volatility) {

  market = roundString(market, LENGTH_TOKEN);
  base = roundString(base, LENGTH_TOKEN);
  exchange = roundString(exchange, LENGTH_EXCHANGE);
  volume = roundVolume(volume);
  btcVolume = roundVolume(btcVolume);
  gain = roundPercent(gain);
  volatility = roundPercent(volatility);

  var symbol = `${exchange}:${market}${base}`;
  var entry = [[symbol, market, base, exchange, volume, btcVolume, gain, volatility]];

  var sql = `INSERT INTO 
              markets (symbol, market, base, exchange, volume, btc_volume, gain, volatility) 
            VALUES 
              ? 
            ON DUPLICATE KEY UPDATE 
              volume = VALUES(volume),
              btc_volume = VALUES(btc_volume),
              gain = VALUES(gain),
              volatility = VALUES(volatility);`;
              
  con.query(sql, [entry], function (err, result) {
    if (err) throw err;
  });

}

exports.marketCandlesInsert = function(startTime, symbol, open, high, low, close, volume, btcVolume) {

  // Making sure decimal precision is not longer than 6
  symbol = roundString(symbol, LENGTH_SYMBOL);
  open = roundPrice(open);
  high = roundPrice(high);
  low = roundPrice(low);
  close = roundPrice(close);
  volume = roundVolume(volume);
  btcVolume = roundVolume(btcVolume);

  var entry = [[startTime,
                symbol,
                open,
                high,
                low,
                close,
                volume,
                btcVolume,]];

  var sql = `INSERT INTO 
              market_candles (start_time, symbol, open, high, low, close, volume, btc_volume) 
            VALUES 
              ? 
            ON DUPLICATE KEY UPDATE 
              high = VALUES(high),
              low = VALUES(low),
              close = VALUES(close),
              volume = VALUES(volume),
              btc_volume = VALUES(btc_volume);`;
              
  con.query(sql, [entry], function (err, result) {
    if (err) throw err;
  });

}

// DB Queries

exports.marketsQuery = function(num, bases, exchanges, type, callback) {

  if (type === 0) type = 'btc_volume';
  else if (type === 1) type = 'gain';
  else if (type === 2) type = 'volatility';
  else return;

  var sql = `SELECT 
              market, base, exchange, volume, btc_volume, gain, volatility
            FROM 
              markets
            WHERE
              base IN  ? AND
              exchange IN ?
            ORDER BY 
              ${type} DESC
            LIMIT ?
              `;

  con.query(sql, [bases, exchanges, num], function (err, result, fields) {
    if (err) throw err;
    callback(result);
  });

}

// DB Maintenence
function test() {

  /*INSERT INTO classroom(teacher_id,student_id)
 VALUES ((SELECT id FROM students WHERE s_name='sam'),
 (SELECT id FROM teacher WHERE t_name='david'));

  var sql = `INSERT INTO 
              market_chunks (interval, symbol, open, high, low, close, volume, btc_volume) 
            VALUES (
              \`30m\`
              (SELECT symbol FROM markets WHERE s_name='sam'),
              (SELECT id FROM teacher WHERE t_name='david')
            )
              
            
            
            
            
              ON DUPLICATE KEY UPDATE 
              high = VALUES(high),
              low = VALUES(low),
              close = VALUES(close),
              volume = VALUES(volume),
              btc_volume = VALUES(btc_volume);`;
              
  con.query(sql, [entry], function (err, result) {
    if (err) throw err;
  });*/

}

exports.init = function() {
  
  con.connect(function(err) {
    if (err) throw err;

    console.log(`Connected to database: ${process.env.MYSQL_DATABASE}`);
  
    // Create markets db
    var sql = `CREATE TABLE IF NOT EXISTS \`markets\` (
                \`symbol\` ${CHAR_SYMBOL} NOT NULL,
                \`market\` ${CHAR_TOKEN} NOT NULL,
                \`base\` ${CHAR_TOKEN} NOT NULL,
                \`exchange\` ${CHAR_EXCHANGE} NOT NULL,
                \`volume\` ${NUM_VOLUME} NOT NULL,
                \`btc_volume\` ${NUM_VOLUME} NOT NULL,
                \`gain\` ${NUM_PERCENT} NOT NULL,
                \`volatility\` ${NUM_PERCENT} NOT NULL,
                PRIMARY KEY( \`symbol\` )
              );`;
  
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created: markets");
    });

    // Create market chunks db
    sql = `CREATE TABLE IF NOT EXISTS \`market_chunks\` (
            \`interval\`  ${ENUM_INTERVAL} NOT NULL,
            \`symbol\` ${CHAR_SYMBOL} NOT NULL REFERENCES markets(\`symbol\`),
            \`open\` ${NUM_PRICE} NOT NULL,
            \`high\` ${NUM_PRICE} NOT NULL,
            \`low\` ${NUM_PRICE} NOT NULL,
            \`close\` ${NUM_PRICE} NOT NULL,
            \`volume\` ${NUM_VOLUME} NOT NULL,
            \`btc_volume\` ${NUM_VOLUME} NOT NULL,
            PRIMARY KEY(\`interval\`, \`symbol\`)
          );`;

    con.query(sql, function (err, result) {
    if (err) throw err;
      console.log("Table created: market_chunks");
    });

    // Create market chunks db
    sql = `CREATE TABLE IF NOT EXISTS \`market_candles\` (
            \`start_time\` ${INT_TIME} NOT NULL,
            \`symbol\` ${CHAR_SYMBOL} NOT NULL REFERENCES markets(\`symbol\`),
            \`open\` ${NUM_PRICE} NOT NULL,
            \`high\` ${NUM_PRICE} NOT NULL,
            \`low\` ${NUM_PRICE} NOT NULL,
            \`close\` ${NUM_PRICE} NOT NULL,
            \`volume\` ${NUM_VOLUME} NOT NULL,
            \`btc_volume\` ${NUM_VOLUME} NOT NULL,
            PRIMARY KEY(\`start_time\`, \`symbol\`)
          );`;

    con.query(sql, function (err, result) {
    if (err) throw err;
      console.log("Table created: market_candles");
    });

  });
}
