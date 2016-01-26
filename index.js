var express = require('express')
var app = express()

var algoController = require('./controllers/algoController');
var databaseController = require('./controllers/databaseController');

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

app.post('/locationFirst', function(request, response){
  var callback = function(data){
    response.send(data);
  } 
  if(request && request.query && request.query.address && request.query.longitude && request.query.latitude) {
    var dbClient = new databaseController(options);
    dbClient.sumbitFirstLocation(request.query.address, request.query.longitude, request.query.latitude, callback);
  } else {
    callback("Invalid Params.");
  }
});

app.post('/locationUpdate', function(request, response){
  var callback = function(data){
    response.send(data);
  }
  if(request && request.query && request.query.address && request.query.longitude && request.query.latitude) {
    var dbClient = new databaseController(options);
    dbClient.updateLocation(request.query.address, request.query.longitude, request.query.latitude, callback);
  } else {
    callback("Invalid Params.");
  }
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("LookUp Server running at http://%s:%s", host, port);

});