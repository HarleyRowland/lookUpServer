var client = null;
var utils = require('../utilities/utils')

var twilio = function(sid, token){
  client = require('twilio')(sid, token); 
};

twilio.prototype.sendLookUpMessage = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to sendMessage function.");
  if(!query.userID) return callback("No number to send to passed to sendMessage function.");
  
  client.messages.create({ 
    to: query.userID, 
    from: "+447481345332", 
    body: "Look Up!",   
  }, function(err, message) { 
    if(err){
      callback(err);
    } else {
      callback(true);
    }
  });
}

twilio.prototype.sendAuthenticationText = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to sendAuthenticationText function.");
  if(!query.userID) return callback("No number to send to passed to sendAuthenticationText function.");
  if(!query.authenticationCode) return callback("No code passed to sendAuthenticationText function.");

  var message = "Your LookUp authentication code is: " + query.authenticationCode + ".";

  client.messages.create({ 
    to: query.userID, 
    from: "+447481345332", 
    body: message,   
  }, function(err, message) { 
    if(err){
      callback(err);
    } else {
      callback(true);
    }
  });
}

module.exports = twilio;