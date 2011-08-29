require('../helper');
var LightRailingSegment = require('../../lib/segment/light-railing-segment');

vows.describe('LightRailingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new LightRailingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  },
  'provides duration in seconds': function() {
    var ws = new LightRailingSegment(0, { duration: { value: 120 } });
    assert.equal(ws.duration, 120);
  }
}).export(module);
