var mysql = require('mysql');
var async = require('async');

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
        callback(null)  
    }
  });
}

database.prototype.newUser = function(query, callback){
  var self = this;
  async.parallel([
    function(callback){
      self.sumbitFirstLocation(query, callback);
    },
    function(callback){
      self.setOptions(query, callback);
    }
  ],
  function(err, results){
    if(err){
      callback(err)
    } else {
      callback("Success");
      connection.end();
    }
  });
}

database.prototype.sumbitFirstLocation = function(query, callback){
    var sqlQuery = 'INSERT INTO userLocations (address, longitude, latitude) VALUES ( ' + connection.escape(query.address) + 
      ',' + connection.escape(query.longitude) + ', ' + connection.escape(query.latitude) + ');';
    
    this.queryDatabase(sqlQuery, callback);
};

database.prototype.setOptions = function(query, callback){
  var columnNames = "";
  var values = ""

  Object.keys(query).forEach(function(element){
    if(element != 'latitude' && element != 'longitude'){
      columnNames = columnNames + element + ",";
      values = values + connection.escape(query[element]) + ",";
    }
  });

  columnNames = columnNames.substring(0, columnNames.length-1);
  values = values.substring(0, values.length-1);

  var sqlQuery = "INSERT INTO userData (" + columnNames + ") VALUES (" + values + ");";
  console.log(sqlQuery);
  this.queryDatabase(sqlQuery, callback);
};

database.prototype.updateLocation = function(address, longitude, latitude, callback){
    var sqlQuery = 'UPDATE userLocations SET longitude=' + connection.escape(longitude) + ', latitude=' + 
    connection.escape(latitude) + ' WHERE address='+ connection.escape(address)+';';
    
    this.queryDatabase(sqlQuery, callback);

    connection.end();
};


database.prototype.updateOptions = function(query, callback){
  var updateString = "";
  var whereString = "";
  
  Object.keys(query).forEach(function(element){
    if(element != "address" && element != 'latitude' && element != longitude){
      updateString = updateString + element + "=" + query[element] + ",";
    } else if(element == "address") {
      whereString = element + "=" + query[element];
    }
  });
  updateString = updateString.substring(0, updateString.length-1);

  var sqlQuery = "UPDATE userData SET " + updateString + " WHERE " + whereString + ";";
  
  this.queryDatabase(sqlQuery, callback);

  connection.end();
};

module.exports = database;