var _ = require('underscore');

var helper = require('../helper'),
    assert = helper.assert,
    sinon = helper.sinon,
    vows = helper.vows;

var mapquestResult = require('../fixtures/mapquest-result'),
    directionsBehavior = require('../directions-behavior');

var MapquestDirections = helper.lib.require('./directions/mapquest-directions');
    MapquestApi = helper.lib.require('./mapquest-api');

var directions = new MapquestDirections();
directions.originLatLng = new google.maps.LatLng(1, 2);
directions.destinationLatLng = new google.maps.LatLng(1, 2);
directions.storeRoute(MapquestDirections.translateRoute(mapquestResult));

vows.describe('MapquestDirections').addBatch({
  '.translateRoute': {
    'translates mapquest directions into a GMaps format': function() {
      var translation = MapquestDirections.translateRoute(mapquestResult);
      assert.isArray( translation.routes);
      assert.isObject(translation.routes[0]);
      assert.isArray( translation.routes[0].legs);
      assert(         translation.routes[0].legs[0].distance.value > 0);
      assert.isArray( translation.routes[0].legs[0].steps);
      assert.isObject(translation.routes[0].legs[0].steps[0]);
      assert.equal(   translation.routes[0].legs[0].steps[0].travel_mode, 'WALKING');
      assert.equal(   translation.routes[0].legs[0].steps[0].distance.value, 98.169984);
      assert.equal(   translation.routes[0].legs[0].steps[0].instructions, 'Start out going north on Broadway toward W 64th St.');
      assert.equal(   translation.routes[0].legs[0].steps[0].path.length, 2);
      assert.equal(   translation.routes[0].legs[0].steps[1].path.length, 1);
      assert.equal(   translation.routes[0].legs[0].steps[3].path.length, 23);
    }
  },

  '.generateOverviewPath': {
    'converts a list of lat/lon numbers to google Lat/Lon objects': function() {
      var pairs = MapquestDirections.generateOverviewPath(mapquestResult.route.shape.shapePoints);
      assert.isArray(pairs);
      assert.equal(pairs.length, mapquestResult.route.shape.shapePoints.length / 2);
      assert.isObject(pairs[0]);
      assert.approximately(pairs[0].lat(), 40.772075);
      assert.approximately(pairs[0].lng(), -73.98207);
    }
  },

  '#storeRoute': directionsBehavior.proviesStoreRoute(directions),

  '#fetchMapquest': sinon.testCase({
    'sends a request to Mapquest API': function() {
      var fetch = sinon.spy(MapquestApi, 'fetch');

      var cb = sinon.stub();
      directions.fetchMapquest(cb);

      assert.deepEqual(_.first(fetch.getCall(0).args, 2), ['1,2', '1,2']);

      MapquestApi.fetch.restore();
    }
  }),
}).export(module, { error: false });
