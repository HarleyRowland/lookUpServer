var client = null;

function(sid, token){
  client = require('twilio')(sid, token); 
};

twilio.prototype.sendMessage = function(query, callback){
  if(!callback) return;
  if(!query) return callback("No query data passed to sendMessage function.");
  if(!query.sendNumber) return callback("No number to send to passed to sendMessage function.");

  client.messages.create({ 
    to: query.sendNumber, 
    from: "+447481345332", 
    body: "LOOK UP friend :D!",   
  }, function(err, message) { 
    if(err){
      callback(err);
    } else {
      callback(true);
    }
  });
}

module.exports = twilio;