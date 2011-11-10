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

  '#getImpacts': {
    topic: bicycling,

    'passes an emissions parameter': function() {
      var emissions;
      bicycling.getImpacts(function(err, impacts) {
        emissions = impacts.carbon;
      });
      assert.equal(emissions, 0);
    }
  }
}).export(module);
