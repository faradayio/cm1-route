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
  '#getEmissionEstimateWithSegment': {
    'results in zero emissions': function() {
      var walk = new WalkingSegment(0, {
        distance: { value: 28.5 },
        instructions: 'Go here' });
      
      var emissions, step;
      walk.getEmissionEstimateWithSegment(function(f_step, emissionEstimate) {
        step = f_step;
        emissions = emissionEstimate.value();
      });

      assert.equal(step.index, 0);
      assert.equal(emissions, 0);
    }
  }
}).export(module);
