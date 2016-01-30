var mysql = require('mysql');
var async = require('async');

var connection = null;

var database = function(dbOptions){
  connection = mysql.createConnection(dbOptions);
  connection.connect();
};

database.prototype.queryDatabase = function(sqlQuery, callback){
  if(!callback) return;
  if(!sqlQuery) return callback("No sqlQuery passed to queryDatabase function.");

  connection.query(sqlQuery, function(error) {
    if (error) {
      callback(error)
    } else {
      callback();  
    }
  });
}

database.prototype.inputUser = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to inputUser function.");

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
      callback(true);
    }
    connection.end(); 
  });
}

database.prototype.newUser = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to newUser function.");
  if(!query.userID) return callback("No userID passed to newUser function.");

  var sqlQuery = 'INSERT INTO user (userID) VALUES (' + connection.escape(query.userID) + ');';

  this.queryDatabase(sqlQuery, callback);
};

database.prototype.sumbitFirstLocation = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to sumbitFirstLocation function.");
  if(!query.userID) return callback("No userID passed to sumbitFirstLocation function.");
  if(!query.longitude) return callback("No longitude passed to sumbitFirstLocation function.");
  if(!query.latitude) return callback("No latitude passed to sumbitFirstLocation function.");

  var sqlQuery = 'INSERT INTO userLocation (userID, longitude, latitude, timestamp) VALUES (' + connection.escape(query.userID) + 
    ',' + connection.escape(query.longitude) + ', ' + connection.escape(query.latitude) + ', NOW());';

  this.queryDatabase(sqlQuery, callback);
};

database.prototype.setSettings = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to setSettings function.");
  if(!query.userID) return callback("No userID passed to setSettings function.");
  if(Object.keys(query).length < 2) return callback("No settings passed to setSettings function.");

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

database.prototype.updateLocation = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to updateLocation function.");
  if(!query.userID) return callback("No userID passed to updateLocation function.");
  if(!query.longitude) return callback("No longitude passed to updateLocation function.");
  if(!query.latitude) return callback("No latitude passed to updateLocation function.");

  var sqlQuery = "UPDATE userLocation SET longitude=" + connection.escape(query.longitude) + ", latitude=" + 
  connection.escape(query.latitude) + ", timestamp=NOW() WHERE userID="+ connection.escape(query.userID)+";";

  this.queryDatabase(sqlQuery, function(err){
    if(err){
      callback(err);
    } else {
      callback(true);
    }
    connection.end();
  });

};


database.prototype.updateOptions = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to updateOptions function.");
  if(!query.userID) return callback("No userID passed to updateOptions function.");
  if(Object.keys(query).length < 2) return callback("No settings passed to updateOptions function.");

  var updateString = "";
  var whereString = "";
  
  Object.keys(query).forEach(function(element){
    if(element != "userID" && element != 'latitude' && element != 'longitude'){
      if(query[element] == NaN){
        updateString = updateString + element + "=" + conection.escape(query[element]) + ",";
      } else {
        updateString = updateString + element + "=" + query[element] + ",";
      }
    } else if(element == "userID") {
      whereString = element + "=" + connection.escape(query[element]);
    }
  });
  updateString = updateString.substring(0, updateString.length-1);

  var sqlQuery = "UPDATE userSettings SET " + updateString + " WHERE " + whereString + ";";

  this.queryDatabase(sqlQuery, function(err){
      if(err){
        callback(err);
      } else {
        callback(true);
      }
      connection.end();
    });

};

module.exports = database;