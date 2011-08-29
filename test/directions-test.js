require('./helper');
var Cm1Result = require('./fixtures/cm1-result'),
    GoogleResult = require('./fixtures/google-result');
var Directions = require('../lib/directions');

var directions = new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
directions.directionsResult = GoogleResult.driving;

var fakeweb = require('fakeweb'),
    http = require('http');
http.register_intercept({
    uri: '/automobile_trips.json', 
    host: 'carbon.brighterplanet.com',
    body: JSON.stringify(Cm1Result.fit)
});

vows.describe('Directions').addBatch({
  '#segments': {
    'returns an array of segments': function() {
      var segments = directions.segments()

      assert.isNumber(segments[0].distance);
      assert.equal(segments[0].index, 0);

      assert.isNumber(segments[1].distance);
      assert.equal(segments[1].index, 1);

      assert.isNumber(segments[2].distance);
      assert.equal(segments[2].index, 2);

      assert.isNumber(segments[3].distance);
      assert.equal(segments[3].index, 3);
    }
  },

  '#getEmissions': {
    'gets emissions for all segments': function() {
      var spies = [];
      directions.eachSegment(function(segment) {
        spies.push(sinon.spy(segment, 'getEmissionEstimateWithSegment'));
      });
      directions.getEmissions(function() {}, function() {});
      spies.forEach(function(spy) {
        sinon.assert.called(spy);
      });
    },
    'fires the onFinish event when all segments have calculated emissions': function() {
      var onFinish = sinon.spy();

      directions.getEmissions(function() {}, function() {}, onFinish);

      sinon.assert.called(onFinish);
    }
  },

  '.events': {
    '.onSegmentEmissionsSuccess': {
      'updates the total emissions': function() {
        var evt = Directions.events.onSegmentEmissionsSuccess(directions, function() {}, function() {});
        directions.totalEmissions = 0;
        evt({}, { value: function() { return 14254.4678; } });
        assert.approximately(directions.totalEmissions, 14254.46, 0.01);
      },
      'fires the onFinish event when all segments have calculated emissions': function() {
        var directions = new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
        directions.segmentEmissionsSuccessCount = 0;
        directions.segments = function() { return [{}, {}, {}, {}]; };

        var onFinish = sinon.spy();

        var onner = Directions.events.onSegmentEmissionsSuccess(directions, function() {}, onFinish);
        onner(0, { value: function() { return 1; } });
        onner(1, { value: function() { return 1; } });
        onner(2, { value: function() { return 1; } });
        onner(3, { value: function() { return 1; } });

        sinon.assert.calledWithExactly(onFinish, directions);
      }
    }
  },

  '#totalTime': {
    "sums each segment's duration and pretty prints the result": function() {
      assert.equal(directions.totalTime(), '6 mins');
    },
    'returns empty string if there are no segments': function() {
      directions._segments = [];
      assert.equal(directions.totalTime(), '');
    }
  }
}).export(module);
