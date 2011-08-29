require('../helper');
var GoogleResult = require('../fixtures/google-result'),
    HopStopResult = require('../fixtures/hop-stop-result');

var GoogleDirectionsRoute = require('../../lib/directions/google-directions-route'),
    HopStopDirections = require('../../lib/directions/hop-stop-directions')
    SubwayingSegment = require('../../lib/segment/subwaying-segment'),
    WalkingSegment = require('../../lib/segment/walking-segment');

var directions = new HopStopDirections('A','B','WALKING','now');
directions.x1 = 1;
directions.y1 = 2;
directions.x2 = 3;
directions.y2 = 4;

var fakeweb = require('fakeweb'),
    http = require('http');

http.register_intercept({
  uri: '/hopstops?x1=1&y1=2&x2=3&y2=4&mode=SUBWAYING&when=now', 
  host: 'hootroot.com',
  body: JSON.stringify(HopStopResult.subway)
});

vows.describe('HopStopDirections').addBatch({
  '#steps': {
    'returns an array of steps': function() {
      directions.directionsResult = { routes: [new GoogleDirectionsRoute(HopStopResult.subway)] };
      var steps = directions.steps();

      assert.equal(steps[0].duration.value, 54);
      assert.equal(steps[1].duration.value, 688);
      assert.equal(steps[2].duration.value, 298);
    }
  },

  '#isFullyGeocoded': {
    'returns true if origin and destination are both geocoded': function() {
      assert.isTrue(directions.isFullyGeocoded());
    },
    'returns false if origin and destination are not geocoded': function() {
      var directions = new HopStopDirections('A','B','WALKING','now');
      directions.x1 = 12;
      directions.y1 = 13;
      directions.x2 = null;
      directions.y2 = null;

      assert.isFalse(directions.isFullyGeocoded());
    }
  },

  '#isAllWalkingSegments': {
    'returns true if all segments are walking segments': function() {
      directions.segments = function() {
        return [
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
        ]
      };

      assert.isTrue(directions.isAllWalkingSegments());
    },
    'returns false if at least one segment is not a walking segment': function() {
      directions.segments = function() {
        return [
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
          new SubwayingSegment(0, {}),
          new WalkingSegment(0, {}),
        ]
      };

      assert.isFalse(directions.isAllWalkingSegments());
    }
  },

  '.events': sinon.testCase({
    '.onGeocodeOriginSuccess': {
      'sets x1 and y1': function() {
        var event = HopStopDirections.events.
          onGeocodeOriginSuccess(directions, sinon.stub(), sinon.stub());
        event(GoogleResult.geocoderResult);
        assert.equal(directions.x1, 1);
        assert.equal(directions.y1, 2);
      },
      'calls #onGeocodeSuccess': function() {
        var onSuccess = sinon.spy();
        var onError = sinon.spy();
        var onGeocodeSuccess = sinon.spy(HopStopDirections.events, 'onGeocodeSuccess');

        var event = HopStopDirections.events.
          onGeocodeOriginSuccess(directions, onSuccess, onError);
        event(GoogleResult.geocoderResult);
        sinon.assert.calledWithExactly(HopStopDirections.events.onGeocodeSuccess, directions, onSuccess, onError);

        HopStopDirections.events.onGeocodeSuccess.restore();
      }
    },

    '.onGeocodeDestinationSuccess': {
      'sets x2 and y2': function() {
        var event = HopStopDirections.events.
          onGeocodeDestinationSuccess(directions, sinon.stub(), sinon.stub());
        event(GoogleResult.geocoderResult);
        assert.equal(directions.x2, 3);
        assert.equal(directions.y2, 4);
      },
      'calls #onGeocodeSuccess': function() {
        var onSuccess = sinon.spy();
        var onError = sinon.spy();
        var onGeocodeSuccess = sinon.spy(HopStopDirections.events, 'onGeocodeSuccess');

        var event = HopStopDirections.events.
          onGeocodeDestinationSuccess(directions, onSuccess, onError);
        event(GoogleResult.geocoderResult);
        sinon.assert.calledWithExactly(onGeocodeSuccess, directions, onSuccess, onError);

        HopStopDirections.events.onGeocodeSuccess.restore();
      },
    },

    '.onGeocodeSuccess': {
      'calculates the route when fully geocoded': function() {
        sinon.stub(directions, 'isFullyGeocoded', function() { return true });
        var onSuccess = sinon.spy();
        var onError = sinon.spy();

        HopStopDirections.events.onGeocodeSuccess(directions, onSuccess, onError);
        sinon.assert.called(onSuccess);

        directions.isFullyGeocoded.restore();
      },
      'does not send a hopstop request if not fully geocoded': function() {
        sinon.stub(directions, 'isFullyGeocoded', function() { return false });
        var onSuccess = sinon.spy('onSuccess');

        HopStopDirections.events.onGeocodeSuccess(directions, onSuccess);
        assert.isFalse(onSuccess.called);

        directions.isFullyGeocoded.restore();
      }
      //'runs the onError method on failure': function() {
        //var onError = sinon.spy('onError');
        //sinon.stub(directions, 'isFullyGeocoded', function() { return true });
        //http.register_intercept({
          //uri: '/hopstops?x1=1&y1=2&x2=3&y2=4&mode=SUBWAYING&when=now', 
          //host: 'hootroot.com'
        //});


        //HopStopDirections.events.onGeocodeSuccess(directions, sinon.stub(), onError);
        //sinon.assert.called(onError);

        //directions.isFullyGeocoded.restore();
      //}
    },

    '.onHopStopSuccess': {
      'sets directionResult on success': function() {
        var event = HopStopDirections.events.onHopStopSuccess(directions, sinon.stub(), sinon.stub());
        event(HopStopResult.subway);
        assert.equal(directions.directionsResult.routes.length, 1);
      },
      'runs the onError method if all segments are walking segments': function() {
        var onError = sinon.spy('onError');
        sinon.stub(directions, 'isFullyGeocoded', function() { return true });
        sinon.stub(directions, 'isAllWalkingSegments', function() { return true });

        var event = HopStopDirections.events.onHopStopSuccess(directions, sinon.stub(), onError);
        event(HopStopResult.walking);
        sinon.assert.called(onError);

        directions.isFullyGeocoded.restore();
        directions.isAllWalkingSegments.restore();
      }
    }
  })
}).export(module);
