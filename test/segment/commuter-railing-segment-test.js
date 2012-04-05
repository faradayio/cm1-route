var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var CommuterRailingSegment = require('../../lib/segment/commuter-railing-segment');

vows.describe('CommuterRailingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new CommuterRailingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  },
  'provides duration in seconds': function() {
    var ws = new CommuterRailingSegment(0, { duration: { value: 120 } });
    assert.equal(ws.duration, 120);
  }
}).export(module);
