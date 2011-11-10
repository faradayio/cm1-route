require('../helper');
var DrivingSegment = require('../../lib/segment/driving-segment');

var fakeweb = require('fakeweb'),
    http = require('http');
http.register_intercept({
  uri: '/automobile_trips.json?distance=3401', 
  host: 'impact.brighterplanet.com',
  body: JSON.stringify({ decisions: { carbon: { object: { value: 6.8 } } } })
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

  '#getImpacts': {
    'passes an emissions parameter': function() {
      var emissions;
      driving.getImpacts(function(err, impacts) {
        emissions = impacts.carbon;
      });
      assert.equal(emissions, 6.8);
    }
  }
}).export(module);
