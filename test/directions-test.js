var helper = require('./helper'),
    vows = helper.vows,
    assert = helper.assert,
    sinon = helper.sinon;

var Cm1Result = require('./fixtures/cm1-result'),
    GoogleResult = require('./fixtures/google-result');

var Directions = helper.lib.require('./directions'),
    DrivingSegment = helper.lib.require('./segment/driving-segment'),
    LightRailingSegment = helper.lib.require('./segment/light-railing-segment'),
    SubwayingSegment = helper.lib.require('./segment/subwaying-segment'),
    WalkingSegment = helper.lib.require('./segment/walking-segment');

vows.describe('Directions').addBatch({
  '#getEmissions': {
    topic: function() {
      var directions = new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
      directions.calculateDistance = sinon.stub();
      directions.storeRoute(GoogleResult.driving);
      directions.segmentEmissionsCallback = sinon.spy();

      directions.getEmissions(this.callback, directions.segmentEmissionsCallback);
    },
    
    'calls back with directions when all segments have calculated emissions': function(err, directions) {
      console.log(err);
      assert.instanceOf(directions, Directions);
    },
    'calls back for each type of segment': function(err, directions) {
      assert.equal(directions.segmentEmissionsCallback.callCount, 1);
    }
  },

  '#totalTime': {
    topic: function() {
      var directions = new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
      directions.calculateDistance = sinon.stub();
      directions.storeRoute(GoogleResult.driving);
      return directions;
    },

    "sums each segment's duration and pretty prints the result": function(directions) {
      assert.equal(directions.totalTime(), '6 mins');
    },
    'returns empty string if there are no segments': function(directions) {
      directions.segments = [];
      assert.equal(directions.totalTime(), '');
    }
  },

  '#isAllWalkingSegments': {
    topic: function() {
      return new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
    },

    'returns true if all segments are walking segments': function(directions) {
      directions.segments = [
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {})
      ];

      assert.isTrue(directions.isAllWalkingSegments());
    },
    'returns false if at least one segment is not a walking segment': function(directions) {
      directions.segments = [
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new SubwayingSegment(0, {}),
        new WalkingSegment(0, {})
      ];

      assert.isFalse(directions.isAllWalkingSegments());
    }
  },

  '#combineSegments': {
    topic: function() {
      return new Directions('Lansing, MI', 'Ann Arbor, MI', 'DRIVING');
    },

    'combines like driving segments': function(directions) {
      directions.segments = [
        new WalkingSegment(1, {distance: { value: 2}, duration:   { value: 3 },
          travel_mode: 'WALKING' }),
        new WalkingSegment(2, {distance: { value: 3}, duration:   { value: 4 },
          travel_mode: 'WALKING' }),
        new SubwayingSegment(3, {distance: { value: 5}, duration: { value: 6 },
          travel_mode: 'SUBWAYING' }),
        new DrivingSegment(4, {distance: { value: 7},
          travel_mode: 'DRIVING' }),
        new DrivingSegment(5, {distance: { value: 8},
          travel_mode: 'DRIVING' }),
        new LightRailingSegment(6, {distance: { value: 7}, duration: { value: 8 },
          travel_mode: 'LIGHTRAILING' }),
        new WalkingSegment(7, {distance: { value: 9}, duration:   { value: 10 },
          travel_mode: 'WALKING' })
      ];

      var segments = directions.combineSegments();

      assert.equal(segments.length, 6);

      assert.instanceOf(segments[0], WalkingSegment);
      assert.instanceOf(segments[1], WalkingSegment);
      assert.instanceOf(segments[2], SubwayingSegment);
      assert.instanceOf(segments[3], LightRailingSegment);
      assert.instanceOf(segments[4], WalkingSegment);

      assert.instanceOf(segments[5], DrivingSegment);
      assert.equal(segments[5].distance, 0.015);
    }
  }
}).export(module, { error: false });
