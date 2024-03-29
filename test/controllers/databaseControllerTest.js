var assert = require('assert');
var sinon = require('sinon');
var mysql = require('mysql');
var async = require('async');

var databaseController = require('../../controllers/databaseController.js');
var dbClient = null;
var connection = {
  connect: function(){
    return true;
  },
  query: function(){
    return true;
  }, 
  end: function(){
    return true;
  }, 
  escape: function(data){
    return data;
  }
};

var data = {
  userID: "+447535620820",
  longitude: "30.123400",
  latitude: "71.928390",
  play: 1,
  myString: "stringyString"
}

describe('Unit Tests - Database Controller', function(){
  
  beforeEach(function(){
    sinon.stub(mysql, 'createConnection').returns(connection);
    dbClient = new databaseController();
  });

  afterEach(function(){
    mysql.createConnection.restore();
  });

  describe('queryDatabase', function(){
    var callback;
    beforeEach(function(){
      callback = sinon.spy();
      sinon.stub(connection, 'query');
    });

    afterEach(function(){
      connection.query.restore();
      callback = null;
    });

    it('should not call connection.query if no callback passed', function(){
      dbClient.queryDatabase("SELECT * FROM user");
      assert.ok(connection.query.notCalled);
    });

    it('should call an error if it isnt passed an SQL query', function(){
      dbClient.queryDatabase(null, callback);
      assert.ok(callback.calledWith("No sqlQuery passed to queryDatabase function."));
    });
      
    it('should call connection.query', function(){
      dbClient.queryDatabase("SELECT * FROM user;", callback);
      assert.ok(connection.query.calledOnce);
    });
  });

  describe('inputUser', function(){
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    it('should not call async.series if no callback passed', function(){
      sinon.stub(async, 'series');
      dbClient.inputUser("SELECT * FROM user");
      assert.ok(async.series.notCalled);
      async.series.restore();
    });
    
    it('should call an error if it isnt passed a query string', function(){
      dbClient.inputUser(null, callback);
      assert.ok(callback.calledWith("No query data passed to inputUser function."));
    });

    it('should call async.series', function(){
      sinon.stub(async, 'series');
      dbClient.inputUser(data, callback);
      assert.ok(async.series.calledOnce);
      async.series.restore();
    });

    it('should call newUser', function(){
      sinon.stub(dbClient, 'newUser');
      sinon.stub(dbClient, 'sumbitFirstLocation');
      sinon.stub(dbClient, 'setSettings');
      dbClient.inputUser(data, callback);
      assert.ok(dbClient.newUser.calledOnce);
      dbClient.newUser.restore();
      dbClient.sumbitFirstLocation.restore();
      dbClient.setSettings.restore();
    });

    it('should callback an error if either newUser, sumbitFirstLocation or setSettings fail', function(){
      sinon.stub(async, 'series').callsArgWith(1, "An Error");
      dbClient.inputUser(data, callback);
      assert.ok(callback.calledWith("An Error"));
      async.series.restore();
    });

    it('should callback true if all methods in async series are successful', function(){
      sinon.stub(async, 'series').callsArgWith(1, null, true);
      dbClient.inputUser(data, callback);
      assert.ok(callback.calledWith(true));
      async.series.restore();
    });

    it('should call connection.end if any of the async series methods return an error', function(){
      sinon.stub(async, 'series').callsArgWith(1, "An Error");
      sinon.stub(connection, 'end');
      dbClient.inputUser(data, callback);
      assert.ok(connection.end.calledOnce);
      async.series.restore();
      connection.end.restore();
    });

    it('should call connection.end if async series methods are successful', function(){
      sinon.stub(async, 'series').callsArgWith(1, null, true);
      sinon.stub(connection, 'end');
      dbClient.inputUser(data, callback);
      assert.ok(connection.end.calledOnce);
      async.series.restore();
      connection.end.restore();
    });
    
  });

  describe('newUser', function(){
    var callback;

    beforeEach(function(){
      sinon.spy(connection, 'escape');
      sinon.stub(dbClient, 'queryDatabase')
      callback = sinon.spy();
    });

    afterEach(function(){
      connection.escape.restore();
      dbClient.queryDatabase.restore();
      callback = null;
    });

    it('should not call dbClient.queryDatabase if no callback passed', function(){
      dbClient.newUser("SELECT * FROM user");
      assert.ok(dbClient.queryDatabase.notCalled);
    });
    
    it('should call an error if it isnt passed a query string', function(){
      dbClient.inputUser(null, callback);
      assert.ok(callback.calledWith("No query data passed to inputUser function."));
    });

    it('should call an error if it isnt passed a userID', function(){
      dbClient.inputUser({}, callback);
      assert.ok(callback.calledWith("No userID passed to newUser function."));
    });

    it('should call connection.escape', function(){
      dbClient.newUser(data, callback);
      assert.ok(connection.escape.calledOnce);
    });

    it('should call queryDatabase', function(){
      dbClient.newUser(data, callback);
      assert.ok(dbClient.queryDatabase.calledOnce);
    });

    it('should call queryDatabase with the correct string', function(){
      dbClient.newUser(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO user (userID) VALUES (+447535620820);"));
    });
  });

  describe('sumbitFirstLocation', function(){
    var callback;

    beforeEach(function(){
      sinon.spy(connection, 'escape');
      sinon.stub(dbClient, 'queryDatabase')
      callback = sinon.spy();
    });

    afterEach(function(){
      connection.escape.restore();
      dbClient.queryDatabase.restore();
      callback = null;
    });

    it('should not call dbClient.queryDatabase if no callback passed', function(){
      dbClient.sumbitFirstLocation("SELECT * FROM user");
      assert.ok(dbClient.queryDatabase.notCalled);
    });
    
    it('should callback an error if it isnt passed a query string', function(){
      dbClient.sumbitFirstLocation(null, callback);
      assert.ok(callback.calledWith("No query data passed to sumbitFirstLocation function."));
    });

    it('should callback an error if it isnt passed a userID', function(){
      dbClient.sumbitFirstLocation({
        longitude: "40.401",
        latitude: "78.201"
      }, callback);
      assert.ok(callback.calledWith("No userID passed to sumbitFirstLocation function."));
    });

    it('should callback an error if it isnt passed longitude', function(){
      dbClient.sumbitFirstLocation({
        userID: "+447535620820",
        latitude: "78.201"
      }, callback);
      assert.ok(callback.calledWith("No longitude passed to sumbitFirstLocation function."));
    });

    it('should callback an error if it isnt passed latitude', function(){
      dbClient.sumbitFirstLocation({
        userID: "+447535620820",
        longitude: "40.401",
      }, callback);
      assert.ok(callback.calledWith("No latitude passed to sumbitFirstLocation function."));
    });

    it('should call connection.escape three times', function(){
      dbClient.sumbitFirstLocation(data, callback);
      assert.ok(connection.escape.calledThrice);
    });

    it('should call queryDatabase', function(){
      dbClient.sumbitFirstLocation(data, callback);
      assert.ok(dbClient.queryDatabase.calledOnce);
    });

    it('should call queryDatabase with the correct string', function(){
      dbClient.sumbitFirstLocation(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userLocation (userID, longitude, latitude, timestamp) VALUES (+447535620820,30.123400, 71.928390, NOW());"));
    });
  });

  describe('setSettings', function(){
    var callback;

    beforeEach(function(){
      sinon.spy(connection, 'escape');
      sinon.stub(dbClient, 'queryDatabase')
      callback = sinon.spy();
    });

    afterEach(function(){
      connection.escape.restore();
      dbClient.queryDatabase.restore();
      callback = null;
      data.play = 1;
    });

    it('should not call dbClient.queryDatabase if no callback passed', function(){
      dbClient.sumbitFirstLocation("SELECT * FROM user");
      assert.ok(dbClient.queryDatabase.notCalled);
    });
    
    it('should callback an error if it isnt passed a query string', function(){
      dbClient.setSettings(null, callback);
      assert.ok(callback.calledWith("No query data passed to setSettings function."));
    });

    it('should callback an error if it isnt passed a userID', function(){
      dbClient.setSettings({
        play: 1
      }, callback);
      assert.ok(callback.calledWith("No userID passed to setSettings function."));
    });

    it('should callback an error if isnt passed any settings', function(){
      dbClient.setSettings({
        userID: "+447535620820"
      }, callback);
      assert.ok(callback.calledWith("No settings passed to setSettings function."));
    });

    it('should call connection.escape', function(){
      dbClient.setSettings(data, callback);
      assert.ok(connection.escape.calledThrice);
    });

    it('should call queryDatabase', function(){
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledOnce);
    });

    it('should call queryDatabase with play setting as 1 if no play setting passed in', function(){
      data.play = null;
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,1,stringyString);"));
    });

    it('should call queryDatabase with play setting as 1 if it is set as true', function(){
      data.play = true;
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,1,stringyString);"));
    });

    it('should call queryDatabase with play setting as 1 if it is set as true string', function(){
      data.play = "true";
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,1,stringyString);"));
    });

    it('should call queryDatabase with play setting as 1 if it is set as 1 string', function(){
      data.play = "1";
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,1,stringyString);"));
    });

    it('should call queryDatabase with play setting as 0 if it is set as false', function(){
      data.play = false;
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,0,stringyString);"));
    });

    it('should call queryDatabase with play setting as 0 if it is set as false string', function(){
      data.play = "false";
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,0,stringyString);"));
    });

    it('should call queryDatabase with play setting as 0 if it is set as 0 string', function(){
      data.play = "0";
      dbClient.setSettings(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("INSERT INTO userSettings (userID,play,myString) VALUES (+447535620820,0,stringyString);"));
    });

  });

  describe('updateLocation', function(){
    var callback;

    beforeEach(function(){
      sinon.spy(connection, 'escape');
      sinon.stub(dbClient, 'queryDatabase')
      callback = sinon.spy();
    });

    afterEach(function(){
      connection.escape.restore();
      dbClient.queryDatabase.restore();
      callback = null;
    });

    it('should not call dbClient.queryDatabase if no callback passed', function(){
      dbClient.updateLocation("SELECT * FROM user");
      assert.ok(dbClient.queryDatabase.notCalled);
    });
    
    it('should callback an error if it isnt passed a query string', function(){
      dbClient.updateLocation(null, callback);
      assert.ok(callback.calledWith("No query data passed to updateLocation function."));
    });

    it('should callback an error if it isnt passed a userID', function(){
      dbClient.updateLocation({
        longitude: "40.401",
        latitude: "78.201"
      }, callback);
      assert.ok(callback.calledWith("No userID passed to updateLocation function."));
    });

    it('should callback an error if it isnt passed longitude', function(){
      dbClient.updateLocation({
        userID: "+447535620820",
        latitude: "78.201"
      }, callback);
      assert.ok(callback.calledWith("No longitude passed to updateLocation function."));
    });

    it('should callback an error if it isnt passed latitude', function(){
      dbClient.updateLocation({
        userID: "+447535620820",
        longitude: "40.401",
      }, callback);
      assert.ok(callback.calledWith("No latitude passed to updateLocation function."));
    });

    it('should call connection.escape three times', function(){
      dbClient.updateLocation(data, callback);
      assert.ok(connection.escape.calledThrice);
    });

    it('should call queryDatabase', function(){
      dbClient.updateLocation(data, callback);
      assert.ok(dbClient.queryDatabase.called);
    });

    it('should call queryDatabase with the correct string', function(){
      dbClient.updateLocation(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userLocation SET longitude=30.123400, latitude=71.928390, timestamp=NOW() WHERE userID=+447535620820;"));
    });
    
  });

  describe('updateOptions', function(){
    var callback;

    beforeEach(function(){
      sinon.spy(connection, 'escape');
      sinon.stub(dbClient, 'queryDatabase')
      callback = sinon.spy();
    });

    afterEach(function(){
      connection.escape.restore();
      dbClient.queryDatabase.restore();
      callback = null;
      data.play = 1;
    });

    it('should not call dbClient.queryDatabase if no callback passed', function(){
      dbClient.updateOptions("SELECT * FROM user");
      assert.ok(dbClient.queryDatabase.notCalled);
    });
    
    it('should callback an error if it isnt passed a query string', function(){
      dbClient.updateOptions(null, callback);
      assert.ok(callback.calledWith("No query data passed to updateOptions function."));
    });

    it('should callback an error if it isnt passed a userID', function(){
      dbClient.updateOptions({
        play: 1
      }, callback);
      assert.ok(callback.calledWith("No userID passed to updateOptions function."));
    });

    it('should callback an error if isnt passed any settings', function(){
      dbClient.updateOptions({
        userID: "+447535620820"
      }, callback);
      assert.ok(callback.calledWith("No settings passed to updateOptions function."));
    });

    it('should call connection.escape', function(){
      dbClient.updateOptions(data, callback);
      assert.ok(connection.escape.called);
    });

    it('should call queryDatabase', function(){
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.called);
    });

    it('should call queryDatabase with the correct string', function(){
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=1,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 1 if no play setting passed in', function(){
      data.play = null;
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=1,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 1 if play set as true', function(){
      data.play = true;
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=1,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 1 if play set as true string', function(){
      data.play = "true";
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=1,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 1 if play set as 1 string', function(){
      data.play = "1";
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=1,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 0 if play set as false', function(){
      data.play = false;
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=0,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 0 if play set as false string', function(){
      data.play = "false";
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=0,myString=stringyString WHERE userID=+447535620820;"));
    });

    it('should call queryDatabase with play setting as 0 if play set as 0 string', function(){
      data.play = "0";
      dbClient.updateOptions(data, callback);
      assert.ok(dbClient.queryDatabase.calledWith("UPDATE userSettings SET play=0,myString=stringyString WHERE userID=+447535620820;"));
    });
    
  });

});