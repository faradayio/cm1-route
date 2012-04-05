var helper = require('./helper'),
    vows = helper.vows,
    assert = helper.assert,
    sinon = helper.sinon;

var Cm1Result = require('./fixtures/cm1-result'),
    GoogleResult = require('./fixtures/google-result');

var Directions = helper.lib.require('./directions'),
    SubwayingSegment = helper.lib.require('./segment/subwaying-segment');
    WalkingSegment = helper.lib.require('./segment/walking-segment');

var directions = new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
directions.calculateDistance = sinon.stub();
directions.storeRoute(GoogleResult.driving);

vows.describe('Directions').addBatch({
  '#getEmissions': {
    topic: function() {
      var directions = new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
      directions.calculateDistance = sinon.stub();
      directions.storeRoute(GoogleResult.driving);
      directions.eachSegment(function(segment) {
        sinon.spy(segment, 'getImpacts');
      });
      directions.segmentEmissionsCallback = sinon.spy();

      directions.getEmissions(this.callback, directions.segmentEmissionsCallback);
    },
    
    'gets emissions for all segments': function(err, directions) {
      directions.eachSegment(function(segment) {
        sinon.assert.called(segment.getImpacts);
      });
    },
    'calls back with directions when all segments have calculated emissions': function(err, directions) {
      assert.instanceOf(directions, Directions);
    },
    'calls back for each segment': function(err, directions) {
      assert.equal(directions.segmentEmissionsCallback.callCount, directions.segments.length);
    }
  },

  '.events': {
    '.onSegmentGetEmissionEstimate': {
      'updates the total emissions': function() {
        var evt = Directions.events.onSegmentGetEmissionEstimate(directions, sinon.stub(), sinon.stub());
        directions.totalEmissions = 0;
        evt(null, { carbon: 14254.4678 });
        assert.approximately(directions.totalEmissions, 14254.46, 0.01);
      }
    }
  },

  '#totalTime': {
    "sums each segment's duration and pretty prints the result": function() {
      assert.equal(directions.totalTime(), '6 mins');
    },
    'returns empty string if there are no segments': function() {
      directions.segments = [];
      assert.equal(directions.totalTime(), '');
    }
  },

  '#isAllWalkingSegments': {
    'returns true if all segments are walking segments': function() {
      directions.segments = [
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {})
      ];

      assert.isTrue(directions.isAllWalkingSegments());
    },
    'returns false if at least one segment is not a walking segment': function() {
      directions.segments = [
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new SubwayingSegment(0, {}),
        new WalkingSegment(0, {})
      ];

      assert.isFalse(directions.isAllWalkingSegments());
    }
  },
}).export(module, { error: false });
