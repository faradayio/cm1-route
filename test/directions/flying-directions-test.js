require('../helper');
var GoogleResult = require('../fixtures/google-result');
var directionsBehavior = require('../directions-behavior');

var DirectionsEvents = require('../../lib/directions-events'),
    FlyingDirections = require('../../lib/directions/flying-directions');

var directions = new FlyingDirections('A','B');

var goodDirections = new FlyingDirections('A','B');
sinon.stub(goodDirections, 'isLongEnough').returns(true);
sinon.stub(goodDirections.geocoder, 'geocode').
  yields(directionsBehavior.geocodedOrigin,
         directionsBehavior.geocodedDestination);
sinon.stub(goodDirections, 'distanceEstimate').returns(50);
var badDirections = new FlyingDirections('A','B');
sinon.stub(badDirections, 'isLongEnough').returns(false);
sinon.stub(badDirections.geocoder, 'geocode').
  yields(directionsBehavior.geocodedOrigin,
         directionsBehavior.geocodedDestination);
sinon.stub(badDirections, 'distanceEstimate').returns(50);

vows.describe('FlyingDirections').addBatch({
  '#steps': {
    'returns an array of a single step': function() {
      directions.isFullyGeocoded = function() { return true; };
      directions.distanceEstimate = function() { return 90000000; };
      directions.originLatLng = { lat: function() { return 1; }, lng: function() { return 2; } };
      directions.destinationLatLng = { lat: function() { return 3; }, lng: function() { return 4; } };
      directions.onGeocodeFinish
      var steps = directions.steps();

      assert.equal(steps[0].duration.value, 511362);
    }
  },

  '#route': directionsBehavior.providesRoute(goodDirections, badDirections),

  '.events': {
    '.onGeocodeFinish': {
      'on success': {
        topic: function() {
          var evt = FlyingDirections.events.onGeocodeFinish(goodDirections, this.callback);
          evt(null);
        },

        'sets directionResult': function(err, directions) {
          assert.isObject(directions.directionsResult);
        }
      },
      'on failure': {
        topic: function() {
          var evt = FlyingDirections.events.onGeocodeFinish(badDirections, this.callback);
          evt(null, {
            origin: directionsBehavior.geocodedOrigin,
            destination: directionsBehavior.geocodedDestination
          });
        },

        'errs back if the distance is too short': function(err) {
          assert.instanceOf(err, Error);
        }
      }
    }
  }
}).export(module, { error: false });
