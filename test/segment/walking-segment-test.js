var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var WalkingSegment = require('../../lib/segment/walking-segment');

vows.describe('WalkingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new WalkingSegment(0, { distance: { value: 3401 } });
    assert.approximately(ws.distance, 3.401, 0.0001)
  },
  'provides duration': function() {
    var ws = new WalkingSegment(0, { duration: { value: 120 } });
    assert.equal(ws.duration, 120)
  },
  '#impacts': {
    'results in zero emissions': function() {
      var walk = new WalkingSegment(0, {
        distance: { value: 28.5 },
        instructions: 'Go here' });
      
      var emissions = walk.impacts();

      assert.equal(emissions.carbon, 0);
    }
  }
}).export(module);
