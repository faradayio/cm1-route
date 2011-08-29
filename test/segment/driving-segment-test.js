require('../helper');
var DrivingSegment = require('../../lib/segment/driving-segment');

var fakeweb = require('fakeweb'),
    http = require('http');
http.register_intercept({
  uri: '/automobile_trips.json?distance=3401', 
  host: 'carbon.brighterplanet.com',
  body: JSON.stringify({ emission: 6.8 })
});

var driving = new DrivingSegment(0, {
  distance: { value: 3401 },
  duration: { value: 3401 },
  instructions: 'Go here' });

vows.describe('DrivingSegment').addBatch({
  'converts distance to kilometers': function() {
    assert.approximately(driving.distance, 3.401, 0.0001)
  },
  'provides duration': function() {
    assert.equal(driving.duration, 3401);
  },

  '#getEmissionEstimateWithSegment': {
    'passes a segment parameter': function() {
      var segment;
      driving.getEmissionEstimateWithSegment(function(f_segment, emissionEstimate) {
        segment = f_segment;
      });
      assert.equal(segment.index, 0);
    },
    'passes an emissions parameter': function() {
      var emissions;
      driving.getEmissionEstimateWithSegment(function(f_segment, emissionEstimate) {
        emissions = emissionEstimate.value();
      });
      assert.equal(emissions, 6.8);
    }
  }
}).export(module);
