var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.MYSQL_SERVICE_HOST,
  port: process.env.MYSQL_SERVICE_PORT,
  user: process.env.databaseuser,
  password: process.env.databasepassword,
  database: process.env.databasename
});


exports.insert = function(market, base, exchange, volume, gain) {

  var symbol = `${exchange}:${market}${base}`;
  var entry = [[symbol, market, base, exchange, (volume).toFixed(2), (gain).toFixed(2)]];

  console.log(entry);

  var sql = `INSERT INTO 
              markets (symbol, market, base, exchange, volume, gain) 
            VALUES 
              ? 
            ON DUPLICATE KEY UPDATE 
              volume = VALUES(volume),
              gain = VALUES(gain);`;
  con.query(sql, [entry], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
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
                \`gain\` numeric(11,2) NOT NULL,
                PRIMARY KEY( \`symbol\` )
              );`;
  
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  });
}