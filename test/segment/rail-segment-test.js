var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var RailSegment = require('../../lib/segment/rail-segment');

vows.describe('RailSegment').addBatch({
  '#impacts': {
    topic: new RailSegment(),

    'returns a value when distance is given': function(train) {
      train.distance = 10;
      assert.isNumber(train.impacts().carbon);
    },
    'returns a value when duration is given': function(train) {
      train.duration = 10;
      assert.isNumber(train.impacts().carbon);
    },
    'returns a value when rail class is given': function(train) {
      train.distance = 10;
      train.trainClass = 'intercity';
      assert.isNumber(train.impacts().carbon);
    }
  }
}).export(module);
