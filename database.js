var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.MYSQL_SERVICE_HOST,
  port: process.env.MYSQL_SERVICE_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

exports.createConnectionTest = function(){
  var con = mysql.createConnection({
  host: process.env.MYSQL_SERVICE_HOST,
  port: 8801, //process.env.MYSQL_SERVICE_PORT
  user: process.env.databaseuser,
  password: process.env.databasepassword,
  database: process.env.databasename
});
}

con.connect(function(err) {
  if (err) 
  {
    console.log("Not Connected!");
    console.log(err);
    //throw err;
  } else {
    console.log("Connected!");
  }
  
});