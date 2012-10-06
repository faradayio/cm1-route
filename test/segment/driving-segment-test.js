var helper = require('../helper'),
    vows = helper.vows,
    assert = helper.assert;

var DrivingSegment = require('../../lib/segment/driving-segment');

var fakeweb = require('fakeweb'),
    http = require('http');
http.register_intercept({
  uri: '/automobile_trips.json?distance=3401', 
  host: 'impact.brightercart.com',
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

  '#impacts': {
    topic: new DrivingSegment(0, {}),

    'returns a value when only distance is given': function(car) {
      car.distance = 10;
      assert.isNumber(car.impacts().carbon);
    },
    'returns a value when fuelEfficency is given': function(car) {
      car.distance = 10;
      car.fuelEfficiency = 24.3;
      assert.isNumber(car.impacts().carbon);
    }
  }
}).export(module);
