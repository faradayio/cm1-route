var helper = require('../helper'),
    lib = helper.lib
    vows = helper.vows,
    assert = helper.assert,
    sinon = helper.sinon;

var HopStopResult = require('../fixtures/hop-stop-result');

var GoogleDirectionsRoute = lib.require('./directions/google-directions-route');

vows.describe('GoogleDirectionsRoute').addBatch({
  'creates a google.maps.DirectionsRoute-like object from Hopstop directions': function() {
    var route = new GoogleDirectionsRoute(HopStopResult.realSubway);
    assert.instanceOf(route.bounds, google.maps.LatLngBounds);
    assert.include(route.copyrights, 'HopStop');
    assert.equal(route.overview_path.length, 4);
    assert.equal(route.legs.length, 1);
    assert.equal(route.legs[0].steps.length, 5);
    assert.equal(route.warnings.length, 0);
  },

  '.generateOverviewPath': {
    'converts steps into an array of LatLngs': function() {
      var path = GoogleDirectionsRoute.generateOverviewPath(HopStopResult.realSubway.steps);
      assert.approximately(path[0].lat(), 40.6819, 0.000001);
      assert.approximately(path[0].lng(), -73.90871, 0.000001);
      assert.approximately(path[1].lat(), 40.68265, 0.000001);
      assert.approximately(path[1].lng(), -73.91002, 0.000001);
      assert.approximately(path[2].lat(), 40.74577, 0.000001);
      assert.approximately(path[2].lng(), -73.98222, 0.000001);
      assert.approximately(path[3].lat(), 40.746824, 0.000001);
      assert.approximately(path[3].lng(), -73.983644, 0.000001);
    }
  },

  '.generateBounds': {
    'gets a southWest corner and a northEast corner': function() {
      var bounds = GoogleDirectionsRoute.generateBounds(HopStopResult.realSubway.steps);
      assert.approximately(bounds.getNorthEast().lat(), 40.746824, 0.000001);
      assert.approximately(bounds.getNorthEast().lng(), -73.90871, 0.000001);
      assert.approximately(bounds.getSouthWest().lat(), 40.6819, 0.000001);
      assert.approximately(bounds.getSouthWest().lng(), -73.983644, 0.000001);
    }
  },

  '.generateSteps': {
    'returns an array of DirectionSteps': function() {
      var steps = GoogleDirectionsRoute.generateSteps(HopStopResult.realSubway.steps);
      assert.equal(steps.length, 5);
      assert.equal(steps[0].duration.value, 32400);
      assert.approximately(steps[0].start_location.lat(), 40.6819, 0.0001);
      assert.approximately(steps[0].start_location.lng(), -73.90871, 0.00001);
      assert.approximately(steps[0].end_location.lat(), 40.68265, 0.00001);
      assert.approximately(steps[0].end_location.lng(), -73.91002, 0.00001);
      assert.include(steps[0].instructions, 'Start out');
      assert.include(steps[0].travel_mode, 'WALKING');
      assert.approximately(steps[0].path[0].lat(), 40.6819, 0.0001);
      assert.approximately(steps[0].path[0].lng(), -73.90871, 0.00001);
      assert.approximately(steps[0].path[1].lat(), 40.68265, 0.00001);
      assert.approximately(steps[0].path[1].lng(), -73.91002, 0.00001);
    }
  }
}).export(module);
