require('../helper');
var GoogleResult = require('../fixtures/google-result'),
    HopStopResult = require('../fixtures/hop-stop-result');
var directionsBehavior = require('../directions-behavior');

var GoogleDirectionsRoute = require('../../lib/directions/google-directions-route'),
    HootrootApi = require('../../lib/hootroot-api'),
    HopStopDirections = require('../../lib/directions/hop-stop-directions')
    SubwayingSegment = require('../../lib/segment/subwaying-segment'),
    WalkingSegment = require('../../lib/segment/walking-segment');

var directions = new HopStopDirections('A','B','WALKING','now');

var goodDirections = new HopStopDirections('A','B');
sinon.stub(goodDirections, 'isAllWalkingSegments').returns(false);
sinon.stub(goodDirections.geocoder, 'geocode').
  yields(directionsBehavior.geocodedOrigin,
         directionsBehavior.geocodedDestination);
var badDirections = new HopStopDirections('A','B');
sinon.stub(badDirections, 'isAllWalkingSegments').returns(true);
sinon.stub(badDirections.geocoder, 'geocode').
  yields(directionsBehavior.geocodedOrigin,
         directionsBehavior.geocodedDestination);

var fakeweb = require('fakeweb'),
    http = require('http');

http.register_intercept({
  uri: '/hopstops?x1=1&y1=2&x2=3&y2=4&mode=SUBWAYING&when=now', 
  host: 'hootroot.com',
  body: JSON.stringify(HopStopResult.subway)
});

vows.describe('HopStopDirections').addBatch({
  '#route': directionsBehavior.providesRoute(goodDirections, badDirections),
  '#storeRoute': directionsBehavior.proviesStoreRoute(goodDirections),
  '#calculateDistance': directionsBehavior.proviesCalculateDistance(goodDirections),

  '#isAllWalkingSegments': {
    'returns true if all segments are walking segments': function() {
      directions.segments = [
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
      ];

      assert.isTrue(directions.isAllWalkingSegments());
    },
    'returns false if at least one segment is not a walking segment': function() {
      directions.segments = [
        new WalkingSegment(0, {}),
        new WalkingSegment(0, {}),
        new SubwayingSegment(0, {}),
        new WalkingSegment(0, {}),
      ];

      assert.isFalse(directions.isAllWalkingSegments());
    }
  },

  '#distanceEstimate': {
    'returns a total distance': function() {
      // TODO
    }
  },

  '.events': sinon.testCase({
    '.fetchHopStop': {
      'sends a request to HopStop API': function() {
        var hopstop = sinon.spy(HootrootApi, 'hopstop');

        var evt = HopStopDirections.events.fetchHopStop(goodDirections);
        evt(sinon.stub());

        assert.deepEqual(hopstop.getCall(0).args[0], {
          x1: 1, y1: 1, x2: 1, y2: 1,
          mode: 'PUBLICTRANSIT', when: 'now'
        });

        HootrootApi.hopstop.restore();
      }
    }
  })
}).export(module, { error: false });
