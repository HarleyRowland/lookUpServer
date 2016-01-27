var mysql = require('mysql');
var connection = null;

var database = function(dbOptions){
  connection = mysql.createConnection(dbOptions);
  connection.connect();
};


database.prototype.queryDatabase = function(sqlQuery, callback){
  connection.query(sqlQuery, function(error) {
    if (error) {
        callback(error)
    } else {
        callback("Success")  
    }
  });
}

database.prototype.sumbitFirstLocation = function(address, longitude, latitude, callback){
    var sqlQuery = 'INSERT INTO userLocations (address, longitude, latitude) VALUES ( ' + connection.escape(address) + 
      ',' + connection.escape(longitude) + ', ' + connection.escape(latitude) + ');';
    
    this.queryDatabase(sqlQuery, callback);

    connection.end();
};

database.prototype.updateLocation = function(address, longitude, latitude, callback){
    var sqlQuery = 'UPDATE userLocations SET longitude=' + connection.escape(longitude) + ', latitude=' + 
    connection.escape(latitude) + ' WHERE address='+ connection.escape(address)+';';
    
    this.queryDatabase(sqlQuery, callback);

    connection.end();
};

database.prototype.setOptions = function(query, callback){
  var columnNames = "";
  var values = ""

  Object.keys(query).forEach(function(element){
    columnNames = columnNames + element + ",";
    values = values + connection.escape(query[element]) + ",";
  });

  columnNames = columnNames.substring(0, columnNames.length-1);
  values = values.substring(0, values.length-1);

  var sqlQuery = "INSERT INTO userData (" + columnNames + ") VALUES (" + values + ");";
  this.queryDatabase(sqlQuery, callback);

  connection.end();
};

database.prototype.updateOptions = function(query, callback){
  var updateString = "";
  var whereString = "";
  
  Object.keys(query).forEach(function(element){
    if(element != "address"){
      updateString = updateString + element + "=" + query[element] + ",";
    } else {
      whereString = element + "=" + query[element];
    }
  });
  updateString = updateString.substring(0, updateString.length-1);

  var sqlQuery = "UPDATE userData SET " + updateString + " WHERE " + whereString + ";";
  console.log(sqlQuery);
  
  this.queryDatabase(sqlQuery, callback);

  connection.end();
};

module.exports = database;