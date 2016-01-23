var mysql = require('mysql');
var connection = null;

var database = function(dbOptions){
  connection = mysql.createConnection(dbOptions);
  connection.connect();
};

database.prototype.sumbitLocation = function(querycallback){
  var query = 'INSERT INTO userLocations (address, longitude, latitude) VALUES (?, ?, ?);'

  connection.query(query, function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
  });

  connection.end();

};

module.exports = database;