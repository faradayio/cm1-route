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
var badDirections = new FlyingDirections('A','B');
sinon.stub(badDirections, 'isLongEnough').returns(false);
sinon.stub(badDirections.geocoder, 'geocode').
  yields(directionsBehavior.geocodedOrigin,
         directionsBehavior.geocodedDestination);

vows.describe('FlyingDirections').addBatch({
  'initializer': {
    'converts IATA airport codes to "XXX Airport"': function() {
      var directions = new FlyingDirections('ORD', 'Dallas, TX');
      assert.equal(directions.origin, 'ORD Airport');
      assert.equal(directions.destination, 'Dallas, TX');
    }
  },

  '#route': directionsBehavior.providesRoute(goodDirections, badDirections),
  '#storeRoute': directionsBehavior.proviesStoreRoute(goodDirections),
  '#calculateDistance': directionsBehavior.proviesCalculateDistance(goodDirections),

  '.translateAirport': {
    'converts a 3-letter IATA airport code into "XXX Airport"': function() {
      assert.equal(FlyingDirections.translateAirport('ORD'), 'ORD Airport');
    },
    'does not change a non-airport code': function() {
      assert.equal(FlyingDirections.translateAirport('GORD'), 'GORD');
    }
  },

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
          assert.instanceOf(err, FlyingDirections.RouteTooShortError);
        }
      }
    }
  }
}).export(module, { error: false });
