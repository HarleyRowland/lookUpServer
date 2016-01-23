var express = require('express')
var app = express()

// var getNameController = require('./controllers/getNameController');

app.get('/', function(request, response){
  response.send("You have used the method GET.");
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("LookUp Server running at http://%s:%s", host, port);

});