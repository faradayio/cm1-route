var helper = require('../helper'),
    lib = helper.lib
    vows = helper.vows,
    assert = helper.assert,
    sinon = helper.sinon;

var GoogleResult = require('../fixtures/google-result');
var directionsBehavior = require('../directions-behavior');

var DirectionsEvents = lib.require('./directions-events'),
    DirectRailDirections = lib.require('./directions/direct-rail-directions');

var directions = new DirectRailDirections('A','B');

var goodDirections = new DirectRailDirections('A','B');
sinon.stub(goodDirections.geocoder, 'geocode').
  yields(directionsBehavior.geocodedOrigin,
         directionsBehavior.geocodedDestination);
var badDirections = new DirectRailDirections('A','B');
sinon.stub(badDirections.geocoder, 'geocode').yields([],[]);

vows.describe('DirectRailDirections').addBatch({
  '#route': directionsBehavior.providesRoute(goodDirections, badDirections),
  '#storeRoute': directionsBehavior.proviesStoreRoute(goodDirections),
  '#calculateDistance': directionsBehavior.proviesCalculateDistance(goodDirections),

  '.events': {
    '.onGeocodeFinish': {
      'on success': {
        topic: function() {
          var evt = DirectRailDirections.events.onGeocodeFinish(goodDirections, this.callback);
          evt(null);
        },

        'sets directionResult': function(err, directions) {
          assert.isObject(directions.directionsResult);
        }
      },
      'on failure': {
        topic: function() {
          var evt = DirectRailDirections.events.onGeocodeFinish(badDirections, this.callback);
          evt(new Error('FAIL'), {});
        },

        'errs back': function(err) {
          assert.instanceOf(err, Error);
        }
      }
    }
  }
}).export(module, { error: false });
