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
  '#route': directionsBehavior.providesRoute(goodDirections, badDirections),
  '#storeRoute': directionsBehavior.proviesStoreRoute(goodDirections),
  '#calculateDistance': directionsBehavior.proviesCalculateDistance(goodDirections),

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
