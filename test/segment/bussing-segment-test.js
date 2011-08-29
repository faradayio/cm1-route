require('../helper');
var BussingSegment = require('../../lib/segment/bussing-segment');

vows.describe('BussingSegment').addBatch({
  'converts distance to kilometers': function() {
    var bs = new BussingSegment(0, { distance: { value: 3401 } });
    assert.approximately(bs.distance, 3.401, 0.0001)
  },
  'provides duration': function() {
    var bs = new BussingSegment(0, { duration: { value: 120 } });
    assert.equal(bs.duration, 120);
  }
}).export(module);
