var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var SubwayingSegment = require('../../lib/segment/subwaying-segment');

vows.describe('SubwayingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new SubwayingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  },
  'stores duration': function() {
    var ws = new SubwayingSegment(0, { distance: { value: 3401 }, duration: { value: 120 } });
    assert.equal(ws.duration, 120);
  }
}).export(module);
