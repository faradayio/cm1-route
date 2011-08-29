require('./helper');
var DirectionsFactory = require('../lib/directions-factory'),
    GoogleDirections = require('../lib/directions/google-directions'),
    HopStopDirections = require('../lib/directions/google-directions');

vows.describe('DirectionsFactory').addBatch({
  '.create': {
    'creates HopStopDirections': function() {
      var dir = DirectionsFactory.create('A','B','PUBLICTRANSIT', 'today');
      assert.isObject(dir);
    },
    'creates GoogleDirections for Driving': function() {
      var dir = DirectionsFactory.create('A','B','DRIVING');
      assert.instanceOf(dir, GoogleDirections);
    },
    'creates GoogleDirections for Walking': function() {
      var dir = DirectionsFactory.create('A','B','WALKING');
      assert.instanceOf(dir, GoogleDirections);
    },
    'creates GoogleDirections for Bicycling': function() {
      var dir = DirectionsFactory.create('A','B','BICYCLING');
      assert.instanceOf(dir, GoogleDirections);
    },
  }
}).export(module);
