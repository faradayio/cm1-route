require('./helper');
var GoogleResult = require('./fixtures/google-result');

var GoogleDirections = require('../lib/directions/google-directions'),
    FootprintedRoute = require('../lib/footprinted-route');

var directions = new GoogleDirections('A','B','DRIVING');
directions.storeRoute(GoogleResult.driving);
directions.totalEmissions = 2386.35;

vows.describe('FootprintedRoute').addBatch({
  'instance methods': {
    topic: new FootprintedRoute(directions, 2308, 2386.35),

    'provides #route': function(fr) {
      assert.isArray(fr.route);
    },

    'provides #distance': function(fr) {
      assert.isNumber(fr.distance);
    },

    'provides #emissions': function(fr) {
      assert.isObject(fr.emissions);
    },

    '#translateEmissions': {
      topic: function(fr) {
        return fr.emissions;
      },

      'provides emissions in kg': function(emissions) {
        assert.approximately(emissions.kilograms, 2386.35, 0.01);
      },
      'provides emissions in lbs': function(emissions) {
        assert.approximately(emissions.pounds, 5261.001, 0.001);
      },
      'provides emissions in tons': function(emissions) {
        assert.approximately(emissions.tons,  2.63, 0.001);
      }
    }
  }
}).export(module);
