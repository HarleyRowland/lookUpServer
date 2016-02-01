var mysql = require('mysql');
var async = require('async');
var utils = require('../utilities/utils')
var twilioController = require('./twilioController');

var accountSid = 'AC010616120338b899ea6b79a04b17c9d7';
var authToken = '05bd4bc2d31cf39d93810b2770dce59e'; 

var connection = null;

var database = function(dbOptions){
  connection = mysql.createConnection(dbOptions);
  connection.connect();
};

database.prototype.queryDatabase = function(sqlQuery, callback){
  if(!callback) return;
  if(!sqlQuery) return callback("No sqlQuery passed to queryDatabase function.");

  connection.query(sqlQuery, function(error, rows) {
    if (error) {
      callback(error)
    } else {
      callback(null, rows);  
    }
  });
}

database.prototype.inputUser = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to inputUser function.");

  var self = this;
  async.series([
    function(callback){
      self.newUser(query, callback);
    },
    function(callback){
      self.sumbitFirstLocation(query, callback);
    },
    function(callback){
      self.setSettings(query, callback);
    },
    function(callback){
      self.setAuthentication(query, callback);
    }, 
    function(callback){
      self.getAuthenticationCode(query, callback);
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

  if(query.play == null || query.play == undefined || query.play == true || query.play == "true" || query.play == "1") query.play = 1;
  if(query.play != null || query.play != undefined){
    if(query.play == false || query.play == "false" || query.play == "0") query.play = 0;
  }

  var columnNames = "";
  var values = "";

  Object.keys(query).forEach(function(element){
    if(element != 'latitude' && element != 'longitude' && element != 'password'){
      columnNames = columnNames + element + ",";
      values = values + connection.escape(query[element]) + ",";
    }
  });

  columnNames = columnNames.substring(0, columnNames.length-1);
  values = values.substring(0, values.length-1);
  var sqlQuery = "INSERT INTO userSettings (" + columnNames + ") VALUES (" + values + ");";

  this.queryDatabase(sqlQuery, callback);
};

database.prototype.setAuthentication = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to setAuthentication function.");
  if(!query.userID) return callback("No userID passed to setAuthentication function.");
  if(!query.password) return callback("No password passed to setAuthentication function.");

  var authenticationCode = utils.generateCode(6);

  var values = connection.escape(query.userID) + "," + connection.escape(query.password) + "," + connection.escape(authenticationCode) + ",0";

  var sqlQuery = "INSERT INTO userAuthentication (userID,password,authenticationCode,userAuthenticated) VALUES (" + values +");";

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

  if(query.play == null || query.play == undefined || query.play == true || query.play == "true" || query.play == "1") query.play = 1;
  if(query.play != null && query.play != undefined){
    if(query.play == false || query.play == "false" || query.play == "0") query.play = 0;
  }

  var updateString = "";
  var whereString = "";
  
  Object.keys(query).forEach(function(element){
    if(element != "userID" && element != 'latitude' && element != 'longitude'){
      if(isNaN(query[element])){
        updateString = updateString + element + "=" + connection.escape(query[element]) + ",";
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

database.prototype.numberStatus = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to numberStatus function.");
  if(!query.userID) return callback("No userID passed to numberStatus function.");

   var sqlQuery = "SELECT * FROM userAuthentication WHERE userID="  + connection.escape(query.userID) + ";";  

   this.queryDatabase(sqlQuery, function(err, rows) {
        if (err) {
          callback(err);
        } else if(rows[0]){
          if(rows[0].userAuthenticated){
            callback("1");
          } else {
            callback("2");
          }
        } else {
          callback("0");
        }
    });

};

database.prototype.getAuthenticationCode = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to numberStatus function.");
  if(!query.userID) return callback("No userID passed to numberStatus function.");

  var sqlQuery = "SELECT authenticationCode FROM userAuthentication WHERE userID="  + connection.escape(query.userID) + ";";  


  this.queryDatabase(sqlQuery, function(err, rows) {
    if (err) {
      callback(err);
    } else if(rows[0] && rows[0].authenticationCode){
      query.authenticationCode = rows[0].authenticationCode;
      var twilio = new twilioController(accountSid, authToken);
      twilio.sendAuthenticationText(query, callback);
    } else {
      callback("UserID passed to getAuthenticationCode is not in database.");
    }
  });
};

database.prototype.authenticatePhoneNumber = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to authenticatePhoneNumber function.");
  if(!query.userID) return callback("No userID passed to authenticatePhoneNumber function.");
  if(!query.authenticationCode) return callback("No authenticationCode passed to authenticatePhoneNumber function.");

  var self = this;

  async.series([
    function(callback){
      self.compareAuthenticationCodes(query, callback);
    },
    function(callback){
      query.play = 1;
      self.authenticateUser(query, callback)
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
};

database.prototype.compareAuthenticationCodes = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to compareAuthenticationCodes function.");
  if(!query.userID) return callback("No userID passed to compareAuthenticationCodes function.");
  if(!query.authenticationCode) return callback("No authenticationCode passed to compareAuthenticationCodes function.");

  var sqlQuery = "SELECT authenticationCode FROM userAuthentication WHERE userID="  + connection.escape(query.userID) + ";";  

  this.queryDatabase(sqlQuery, function(err, rows) {
    if (err) {
      callback(err);
    } else if(rows[0] && rows[0].authenticationCode){
      if(rows[0].authenticationCode == query.authenticationCode){
        callback();
      } else {
        callback("Incorrect Code");
      }
    } else {
      callback("UserID passed to compareAuthenticationCodes is not in database.");
    }
  });
};

database.prototype.authenticateUser = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to authenticateUser function.");
  if(!query.userID) return callback("No userID passed to authenticateUser function.");

  var sqlQuery = "UPDATE userAuthentication SET userAuthenticated=1 WHERE userID=" + connection.escape(query.userID)+";";  

  this.queryDatabase(sqlQuery, callback);
};

module.exports = database;