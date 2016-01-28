var client = null;

var twilio = function(sid, token){
  client = require('twilio')(sid, token); 
};

twilio.prototype.sendMessage = function(query, callback){
  client.messages.create({ 
    to: query.sendNumber, 
    from: "+447481345332", 
    body: "LOOK UP friend :D!",   
  }, function(err, message) { 
    if(err){
      console.log(err); 
      callback(err);
    } else {
      callback("Success");
    }
  });
}

module.exports = twilio;