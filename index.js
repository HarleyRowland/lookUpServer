var express = require('express')
var app = express()

var algoController = require('./controllers/algoController');
var databaseController = require('./controllers/databaseController');
var twilioController = require('./controllers/twilioController');

var accountSid = 'AC010616120338b899ea6b79a04b17c9d7';
var authToken = '05bd4bc2d31cf39d93810b2770dce59e'; 

var options = {
  user: 'hjr7',
  password: '8dmealw',
  host: 'dragon.ukc.ac.uk',
  port: 3306,
  database: 'hjr7'
}

app.get('/', function(request, response){
  response.send("LookUp Server.");
});

app.get('/sendSMS', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.userID){
    var twilio = new twilioController(accountSid, authToken);
    twilio.sendLookUpMessage(request.query, callback);
  } else {
    callback("Invalid Params.");
  }
});

app.post('/newUser', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.userID && request.query.longitude && request.query.latitude && request.query.password) {
    var dbClient = new databaseController(options);
    dbClient.inputUser(request.query, callback);
  } else {
    callback("Invalid Params.");
  }
});

app.post('/locationUpdate', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.userID && request.query.longitude && request.query.latitude) {
    var dbClient = new databaseController(options);
    dbClient.updateLocation(request.query, callback);
  } else {
    callback("Invalid Params.");
  }
});

app.post('/optionsUpdate', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.userID) {
    var dbClient = new databaseController(options);
    dbClient.updateOptions(request.query, callback);
  } else {
    callback("Invalid Params.");
  }
});

app.post('/numberStatus', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.userID) {
    var dbClient = new databaseController(options);
    dbClient.numberStatus(request.query, callback);
  } else {
    callback("Invalid Params.");
  }
});

app.post('/authenticatePhoneNumber', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.userID && request.query.authenticationCode) {
    var dbClient = new databaseController(options);
    dbClient.authenticatePhoneNumber(request.query, callback);
  } else {
    callback("Invalid Params.");
  }
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("LookUp Server running at http://%s:%s", host, port);

});