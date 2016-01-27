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
        callback("Success");  
    }
  });
}

database.prototype.inputUser = function(query, callback){
  console.log("HELLOOOO");
  var self = this;
  async.parallel([
    function(callback){
      self.newUser(query, callback);
    },
    function(callback){
      self.sumbitFirstLocation(query, callback);
    },
    function(callback){
      self.setSettings(query, callback);
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

database.prototype.newUser = function(query, callback){
    console.log(query);

    var sqlQuery = 'INSERT INTO user (userID) VALUES ( ' + connection.escape(query.userID) + ');';
    
    this.queryDatabase(sqlQuery, callback);
};

database.prototype.sumbitFirstLocation = function(query, callback){
    var sqlQuery = 'INSERT INTO userLocation (userID, longitude, latitude, timestamp) VALUES ( ' + connection.escape(query.userID) + 
      ',' + connection.escape(query.longitude) + ', ' + connection.escape(query.latitude) + ', NOW());';
    
    this.queryDatabase(sqlQuery, callback);
};

database.prototype.setSettings = function(query, callback){
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

  var sqlQuery = "INSERT INTO userSettings (" + columnNames + ") VALUES (" + values + ");";

  this.queryDatabase(sqlQuery, callback);
};

database.prototype.updateLocation = function(userID, longitude, latitude, callback){
    var sqlQuery = "UPDATE userLocation SET longitude=" + connection.escape(longitude) + ", latitude=" + 
    connection.escape(latitude) + ", timestamp=NOW() WHERE userID="+ connection.escape(userID)+";";
    
    this.queryDatabase(sqlQuery, callback);

    connection.end();
};


database.prototype.updateOptions = function(query, callback){
  var updateString = "";
  var whereString = "";
  
  Object.keys(query).forEach(function(element){
    if(element != "userID" && element != 'latitude' && element != longitude){
      updateString = updateString + element + "=" + query[element] + ",";
    } else if(element == "userID") {
      whereString = element + "=" + query[element];
    }
  });
  updateString = updateString.substring(0, updateString.length-1);

  var sqlQuery = "UPDATE userData SET " + updateString + " WHERE " + whereString + ";";
  
  this.queryDatabase(sqlQuery, callback);

  connection.end();
};

module.exports = database;