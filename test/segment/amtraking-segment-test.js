var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var AmtrakingSegment = helper.lib.require('./segment/amtraking-segment');

vows.describe('AmtrakingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new AmtrakingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  },
  'provides duration in seconds': function() {
    var ws = new AmtrakingSegment(0, { duration: { value: 120 } });
    assert.equal(ws.duration, 120);
  }
}).export(module);
