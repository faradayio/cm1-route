var helper = require('./helper'),
    lib = helper.lib,
    vows = helper.vows,
    assert = helper.assert;

var DirectionsFactory = lib.require('./directions-factory'),
    GoogleDirections = lib.require('./directions/google-directions'),
    HopStopDirections = lib.require('./directions/google-directions');

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
