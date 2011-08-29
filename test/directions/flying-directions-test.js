require('../helper');
var GoogleResult = require('../fixtures/google-result');
var FlyingDirections = require('../../lib/directions/flying-directions');

var directions, geocoder;
var geocoder = sinon.spy('google.maps.Geocoder.geocode');

var geoDirections = new FlyingDirections('A','B','WALKING','now');

vows.describe('FlyingDirections').addBatch({
  '#steps': {
    topic: function() { return new FlyingDirections('A','B','WALKING','now'); },

    'returns an array of a single step': function(directions) {
      directions.isFullyGeocoded = function() { return true; };
      directions.distanceEstimate = function() { return 90000000; };
      directions.originLatLng = { lat: function() { return 1; }, lng: function() { return 2; } };
      directions.destinationLatLng = { lat: function() { return 3; }, lng: function() { return 4; } };
      directions.onGeocodeSuccess
      var steps = directions.steps();

      assert.equal(steps[0].duration.value, 511362);
    }
  },

  //'#route': {
    //var onSuccess, onError;
    //beforeEach(function() {
      //onSuccess = jasmine.createSpy();
      //onError = jasmine.createSpy();
    //});
    //'geocodes origin': function() {
    //  directions.route(onSuccess, onError);
    //  assert.equal(geocoder.argsForCall[0][0].address, 'A');
    //});
    //'geocodes destination': function() {
    //  directions.route(onSuccess, onError);
    //  assert.equal(geocoder.argsForCall[1][0].address, 'B');
    //});
  //});

  '#isFullyGeocoded': {
    topic: function() { return new FlyingDirections('A','B','WALKING','now'); },

    'returns true if origin and destination are both geocoded': function(directions) {
      directions.originLatLng = {};
      directions.destinationLatLng = {};

      assert.isTrue(directions.isFullyGeocoded());
    },
    'returns false if origin and destination are not geocoded': function(directions) {
      directions.originLatLng = {};
      directions.destinationLatLng = null;

      assert.isFalse(directions.isFullyGeocoded());
    }
  },

  '.events': {
    topic: function() {
      var directions = new FlyingDirections('A','B','WALKING','now');
      directions.originLatLng = { lat: function() { return 1; }, lng: function() { return 2; } };
      directions.destinationLatLng = { lat: function() { return 3; }, lng: function() { return 4; } };
      directions.mode = 'WALKING';
      directions.when = 'now';
      directions.distanceEstimate = function() { return 90000000; };
      directions.isLongEnough = function() { return true; };
      return directions;
    },

    '.onGeocodeOriginSuccess': sinon.testCase({
      'sets originLatLng': function(directions) {
        sinon.stub(FlyingDirections.events, 'onGeocodeSuccess');

        var event = FlyingDirections.events.onGeocodeOriginSuccess(directions, sinon.stub(), sinon.stub());
        var location = {};
        event([{geometry: { location: location } }]);
        assert.equal(directions.originLatLng, location);

        FlyingDirections.events.onGeocodeSuccess.restore();
      },
      'calls .events.onGeocodeSuccess': function(directions) {
        var onSuccess = sinon.spy();
        var onError = sinon.spy();
        var onGeocodeSuccess = sinon.spy(FlyingDirections.events, 'onGeocodeSuccess');

        var event = FlyingDirections.events.onGeocodeOriginSuccess(directions, onSuccess, onError);
        event(GoogleResult.geocoderResult);

        sinon.assert.calledWithExactly(onGeocodeSuccess, directions, onSuccess, onError);

        FlyingDirections.events.onGeocodeSuccess.restore();
      }
    }),

    '.onGeocodeDestinationSuccess': sinon.testCase({
      'sets destinationLatLng': function(directions) {
        sinon.stub(FlyingDirections.events, 'onGeocodeSuccess');
        var event = FlyingDirections.events.onGeocodeDestinationSuccess(directions, sinon.stub(), sinon.stub());
        var location = {};
        event([{geometry: { location: location } }]);
        assert.equal(directions.destinationLatLng, location);

        FlyingDirections.events.onGeocodeSuccess.restore();
      },
      'calls #onGeocodeSuccess': function(directions) {
        var onSuccess = sinon.spy(), onError = sinon.spy();
        var onGeocodeSuccess = sinon.spy(FlyingDirections.events, 'onGeocodeSuccess');

        var event = FlyingDirections.events.onGeocodeDestinationSuccess(directions, onSuccess, onError);
        event(GoogleResult.geocoderResult);
        sinon.assert.calledWithExactly(onGeocodeSuccess, directions, onSuccess, onError);

        FlyingDirections.events.onGeocodeSuccess.restore();
      }
    }),

    '.onGeocodeSuccess': {
      'calls onSuccess when origin and destination have been geocoded': sinon.test(function(directions) {
        sinon.stub(directions, 'isFullyGeocoded', function() { return true; });
        sinon.stub(directions, 'isLongEnough', function() { return true; });
        var onSuccess = sinon.spy();

        FlyingDirections.events.onGeocodeSuccess(directions, onSuccess);
        sinon.assert.calledOnce(onSuccess);

        directions.isFullyGeocoded.restore();
        directions.isLongEnough.restore();
      }),
      'sets directionResult on success': function(directions) {
        sinon.stub(directions, 'isFullyGeocoded', function() { return true; });
        FlyingDirections.events.onGeocodeSuccess(directions, sinon.stub());
        assert.isObject(directions.directionsResult);

        directions.isFullyGeocoded.restore();
      },
      'runs the onError method if the distance is too short': function(directions) {
        sinon.stub(directions, 'isFullyGeocoded', function() { return true; });
        sinon.stub(directions, 'isLongEnough', function() { return false; });
        var onError = sinon.spy();

        FlyingDirections.events.onGeocodeSuccess(directions, sinon.stub(), onError);
        sinon.assert.calledOnce(onError);

        directions.isFullyGeocoded.restore();
        directions.isLongEnough.restore();
      }
    }
  }
}).export(module);
