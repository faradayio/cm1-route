var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var BicyclingSegment = require('../../lib/segment/bicycling-segment');

var bicycling = new BicyclingSegment(0, {
  distance: { value: 28.5 },
  duration: { value: 4800 },
  instructions: 'Go here' });

vows.describe('BicyclingSegment').addBatch({
  'provides duration': function() {
    assert.equal(bicycling.duration, 4800);
  },

  '#impacts': {
    'returns emissions': function() {
      var emissions = bicycling.impacts();
      assert.equal(emissions.carbon, 0);
    }
  }
}).export(module);
