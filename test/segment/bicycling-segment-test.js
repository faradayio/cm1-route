require('../helper');
var BicyclingSegment = require('../../lib/segment/bicycling-segment');

var bicycling = new BicyclingSegment(0, {
  distance: { value: 28.5 },
  duration: { value: 4800 },
  instructions: 'Go here' });

vows.describe('BicyclingSegment').addBatch({
  'provides duration': function() {
    assert.equal(bicycling.duration, 4800);
  },

  '#getEmissionEstimateWithSegment': {
    topic: bicycling,

    'passes a segment parameter': function() {
      var segment;
      bicycling.getEmissionEstimateWithSegment(function(f_segment, emissionEstimate) {
        segment = f_segment;
      });
      assert.equal(segment.index, 0);
    },
    'passes an emissions parameter': function() {
      var emissions;
      bicycling.getEmissionEstimateWithSegment(function(f_segment, emissionEstimate) {
        emissions = emissionEstimate.value();
      });
      assert.equal(emissions, 0);
    }
  }
}).export(module);
