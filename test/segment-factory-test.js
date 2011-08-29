require('./helper');
var SegmentFactory = require('../lib/segment-factory');
var BicyclingSegment = require('../lib/segment/bicycling-segment'),
    BussingSegment = require('../lib/segment/bussing-segment'),
    DrivingSegment = require('../lib/segment/driving-segment'),
    SubwayingSegment = require('../lib/segment/subwaying-segment'),
    WalkingSegment = require('../lib/segment/walking-segment');

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
