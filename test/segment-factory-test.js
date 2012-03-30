var helper = require('./helper'),
    lib = helper.lib,
    vows = helper.vows,
    assert = helper.assert;

var SegmentFactory = lib.require('./segment-factory');
var BicyclingSegment = lib.require('./segment/bicycling-segment'),
    BussingSegment = lib.require('./segment/bussing-segment'),
    DrivingSegment = lib.require('./segment/driving-segment'),
    SubwayingSegment = lib.require('./segment/subwaying-segment'),
    WalkingSegment = lib.require('./segment/walking-segment');

vows.describe('SegmentFactory').addBatch({
  '.create': {
    'reutrns a DrivingSegment object': function() {
      var step = { distance: 1, travel_mode: 'DRIVING' };
      var segment = SegmentFactory.create(0, step);
      assert.instanceOf(segment, DrivingSegment);
    },
    'returns a WalkingSegment object': function() {
      var step = { distance: 1, travel_mode: 'WALKING' };
      var segment = SegmentFactory.create(0, step);
      assert.instanceOf(segment, WalkingSegment);
    },
    'returns a BicyclingSegment object': function() {
      var step = { distance: 1, travel_mode: 'BICYCLING' };
      var segment = SegmentFactory.create(0, step);
      assert.instanceOf(segment, BicyclingSegment);
    },
    'returns a SubwayingSegment object': function() {
      var step = { distance: 1, travel_mode: 'SUBWAYING' };
      var segment = SegmentFactory.create(0, step);
      assert.instanceOf(segment, SubwayingSegment);
    },
    'returns a BussingSegment object': function() {
      var step = { distance: 1, travel_mode: 'BUSSING' };
      var segment = SegmentFactory.create(0, step);
      assert.instanceOf(segment, BussingSegment);
    },
    'throws an exception for an invalid travel mode': function() {
      var step = { distance: 1, travel_mode: 'HITCHHIKING' };
      assert.throws(function() {
        SegmentFactory.create(0, step);
      });
    }
  }
}).export(module);
