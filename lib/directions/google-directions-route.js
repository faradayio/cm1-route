var _ = require('underscore');

var GoogleDirectionsRoute = {
  generateBounds: function(pairs) {
    var corners = {};

    _.each(pairs, function(pair) {
      corners = GoogleDirectionsRoute.recordCoords(pair, corners);
    });

    if(corners.sWLat != null && corners.sWLng != null && 
       corners.nELat != null && corners.nELng != null) {
      var southWest = new google.maps.LatLng(corners.sWLat, corners.sWLng);
      var northEast = new google.maps.LatLng(corners.nELat, corners.nELng);
      return new google.maps.LatLngBounds(southWest, northEast);
    } else {
      return null;
    }
  },

  recordCoords: function(location, corners) {
    if(location) {
      var lat = location.lat();
      var lng = location.lng();
      corners.sWLat = (corners.sWLat == null ? lat : Math.min(corners.sWLat, lat));
      corners.sWLng = (corners.sWLng == null ? lng : Math.min(corners.sWLng, lng));
      corners.nELat = (corners.nELat == null ? lat : Math.max(corners.nELat, lat));
      corners.nELng = (corners.nELng == null ? lng : Math.max(corners.nELng, lng));
    }

    return corners;
  }
};

module.exports = GoogleDirectionsRoute;
