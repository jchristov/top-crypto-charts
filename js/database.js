var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.MYSQL_SERVICE_HOST,
  port: process.env.MYSQL_SERVICE_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});


exports.insert = function(market, base, exchange, volume, btcVolume, gain, volatility) {

  var symbol = `${exchange}:${market}${base}`;
  var entry = [[symbol, market, base, exchange, (volume).toFixed(2), (btcVolume).toFixed(2), (gain).toFixed(2), (volatility).toFixed(2)]];

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

exports.query = function(num, bases, exchanges, type, callback) {

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

    //return result;
  });

}

exports.init = function() {
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  
    var sql = `CREATE TABLE IF NOT EXISTS \`markets\` (
                \`symbol\` varchar(255) NOT NULL,
                \`market\` varchar(255) NOT NULL,
                \`base\` varchar(255) NOT NULL,
                \`exchange\` varchar(255) NOT NULL,
                \`volume\` numeric(11,2) NOT NULL,
                \`btc_volume\` numeric(11,2) NOT NULL,
                \`gain\` numeric(11,2) NOT NULL,
                \`volatility\` numeric(11,2) NOT NULL,
                PRIMARY KEY( \`symbol\` )
              );`;
  
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  });
}
