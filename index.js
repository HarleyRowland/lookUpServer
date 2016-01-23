var express = require('express')
var app = express()

var algoController = require('./controllers/algoController');
var databaseController = require('./controllers/databaseController');


app.get('/', function(request, response){
  response.send("LookUp Server.");
});

app.post('/startAlgo', function(request, response){
  if(request && request.query && request.query.token) {
    algoController(request, response);
  } else {
    response.send("Invalid Token.");
  }
});

app.post('/location', function(request, response){
  if(request && request.query && request.query.indentifier && request.query.gps) {
    databaseController.submitLocation(request.query.indentifier, request.query.gps, response);
  } else {
    response.send("Invalid Params.");
  }
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("LookUp Server running at http://%s:%s", host, port);

});