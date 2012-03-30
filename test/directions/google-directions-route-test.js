var helper = require('../helper'),
    lib = helper.lib
    vows = helper.vows,
    assert = helper.assert;

var GoogleDirectionsRoute = lib.require('./directions/google-directions-route');

vows.describe('GoogleDirectionsRoute').addBatch({
  '.generateBounds': {
    'gets a southWest corner and a northEast corner': function() {
      var coords = [
        new google.maps.LatLng(40.6819, -73.90871),
        new google.maps.LatLng(40.68265, -73.91002),
        new google.maps.LatLng(40.74577, -73.98222),
        new google.maps.LatLng(40.746824, -73.983644)
      ];
      var bounds = GoogleDirectionsRoute.generateBounds(coords);
      assert.approximately(bounds.getNorthEast().lat(), 40.746824, 0.000001);
      assert.approximately(bounds.getNorthEast().lng(), -73.90871, 0.000001);
      assert.approximately(bounds.getSouthWest().lat(), 40.6819, 0.000001);
      assert.approximately(bounds.getSouthWest().lng(), -73.983644, 0.000001);
    }
  }
}).export(module);
