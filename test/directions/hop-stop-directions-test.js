require('../helper');
var async = require('async');

var GoogleResult = require('../fixtures/google-result'),
    HopStopResult = require('../fixtures/hop-stop-result');
var directionsBehavior = require('../directions-behavior');

var Directions = require('../../lib/directions'),
    GoogleDirectionsRoute = require('../../lib/directions/google-directions-route'),
    HootrootApi = require('../../lib/hootroot-api'),
    HopStopDirections = require('../../lib/directions/hop-stop-directions')
    SubwayingSegment = require('../../lib/segment/subwaying-segment'),
    WalkingSegment = require('../../lib/segment/walking-segment');

var directions = new HopStopDirections('A','B','WALKING','now');

var goodDirections = new HopStopDirections('A','B');
goodDirections.storeRoute({routes: [{ legs: [HopStopResult.realSubway] }]});
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
  uri: '/hopstops?x1=1&y1=1&x2=1&y2=1&mode=PUBLICTRANSIT&when=now', 
  host: 'cm1-route.brighterplanet.com',
  body: JSON.stringify(HopStopResult.subway)
});

vows.describe('HopStopDirections').addBatch({
  '#route': directionsBehavior.providesRoute(goodDirections, badDirections, sinon.testCase({
    'uses railCallbackFallback event for SUBWAYING': function() {
      sinon.stub(async, 'parallel');
      sinon.spy(HopStopDirections.events, 'railFallbackCallback');
      directions.mode = 'SUBWAYING';
      directions.route(sinon.stub());
      sinon.assert.called(HopStopDirections.events.railFallbackCallback);

      async.parallel.restore();
      HopStopDirections.events.railFallbackCallback.restore();
    },
    'uses busFallbackCallback event for BUSSING': function() {
      sinon.stub(async, 'parallel');
      sinon.spy(HopStopDirections.events, 'busFallbackCallback');
      directions.mode = 'BUSSING';
      directions.route(sinon.stub());
      sinon.assert.called(HopStopDirections.events.busFallbackCallback);

      async.parallel.restore();
      HopStopDirections.events.busFallbackCallback.restore();
    }
  })),

  '#storeRoute': directionsBehavior.proviesStoreRoute(goodDirections),
  '#calculateDistance': directionsBehavior.proviesCalculateDistance(goodDirections),

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

  '.shouldDefaultTransitToDirectRoute': {
    'returns true for an AllWalkingSegmentsError and TRANSIT_DIRECT_DEFAULT env is true': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = true;
      var err = new HopStopDirections.AllWalkingSegmentsError('FAIL');
      assert.isTrue(HopStopDirections.shouldDefaultTransitToDirectRoute(err));
    },
    'returns false for null err': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = true;
      assert.isFalse(HopStopDirections.shouldDefaultTransitToDirectRoute(null));
    },
    'returns false for non-AllWalkingSegmentsError': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = true;
      var err = new Error('LULZ');
      assert.isFalse(HopStopDirections.shouldDefaultTransitToDirectRoute(null));
    },
    'returns false if TRANSIT_DIRECT_DEFAULT env is false': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = false;
      var err = new HopStopDirections.AllWalkingSegmentsError('FAIL');
      assert.isFalse(HopStopDirections.shouldDefaultTransitToDirectRoute(err));
    }
  },

  '#fetchHopStop': sinon.testCase({
    'sends a request to HopStop API': function() {
      var hopstop = sinon.spy(HootrootApi, 'hopstop');

      directions.params = function() { 
        return {
          x1: 1, y1: 1, x2: 1, y2: 1,
          mode: 'PUBLICTRANSIT', when: 'now'
        };
      };
      directions.fetchHopStop(sinon.stub());

      assert.deepEqual(hopstop.getCall(0).args[0], {
        x1: 1, y1: 1, x2: 1, y2: 1,
        mode: 'PUBLICTRANSIT', when: 'now'
      });

      HootrootApi.hopstop.restore();
    }
  }),
}).export(module, { error: false });
