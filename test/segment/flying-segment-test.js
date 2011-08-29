require('../helper');
var FlyingSegment = require('../../lib/segment/flying-segment');

vows.describe('FlyingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new FlyingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  }
}).export(module);
