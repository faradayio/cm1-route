require('../helper');
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
  '#getEmissionEstimate': {
    'results in zero emissions': function() {
      var walk = new WalkingSegment(0, {
        distance: { value: 28.5 },
        instructions: 'Go here' });
      
      var emissions, step;
      walk.getEmissionEstimate(function(err, emissionEstimate) {
        emissions = emissionEstimate.value();
      });

      assert.equal(emissions, 0);
    }
  }
}).export(module);
