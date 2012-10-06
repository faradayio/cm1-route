var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var FlyingSegment = require('../../lib/segment/flying-segment');

vows.describe('FlyingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new FlyingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  },
  '#impacts': {
    topic: new FlyingSegment(0, {}),

    'returns a value when only distance is given': function(plane) {
      plane.distance = 10;
      assert.isNumber(plane.impacts().carbon);
    },
    'returns a value when seatClassName is given': function(plane) {
      plane.distance = 10;
      plane.seatClassName = 'business';
      assert.isNumber(plane.impacts().carbon);
    }
  }
}).export(module);
