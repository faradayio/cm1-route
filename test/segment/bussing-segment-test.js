var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var BussingSegment = require('../../lib/segment/bussing-segment');

vows.describe('BussingSegment').addBatch({
  'converts distance to kilometers': function() {
    var bs = new BussingSegment(0, { distance: { value: 3401 } });
    assert.approximately(bs.distance, 3.401, 0.0001)
  },
  'provides duration': function() {
    var bs = new BussingSegment(0, { duration: { value: 120 } });
    assert.equal(bs.duration, 120);
  },
  '#impacts': {
    topic: new BussingSegment(0, { }),

    'returns a value when distance is given': function(bus) {
      bus.distance = 10;
      assert.isNumber(bus.impacts().carbon);
    },
    'returns a value when duration is given': function(bus) {
      bus.duration = 10;
      assert.isNumber(bus.impacts().carbon);
    },
    'returns a value when bus class is given': function(bus) {
      bus.distance = 10;
      bus.busClass = 'regional';
      assert.isNumber(bus.impacts().carbon);
    }
  }
}).export(module);
