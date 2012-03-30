var GoogleDirectionsRoute = {
  generateOverviewPath: function(steps) {
    var path = [];
    for(i in steps) {
      var step = steps[i];
      if(step.start_location) {
        var startLatLng = new google.maps.LatLng(
          step.start_location.lat, step.start_location.lon );
        path.push(startLatLng);
        var endLatLng = new google.maps.LatLng(
            step.end_location.lat, step.end_location.lon);
        path.push(endLatLng);
      }
    }

    return path;
  },

  generateBounds: function(steps) {
    var coords = {};

    for(i in steps) {
      var step = steps[i];
      coords = this.recordCoords(step.start_location, coords);
      coords = this.recordCoords(step.end_location, coords);
    }

    if(coords.sWLat != null && coords.sWLng != null && 
       coords.nELat != null && coords.nELng != null) {
      var southWest = new google.maps.LatLng(coords.sWLat, coords.sWLng);
      var northEast = new google.maps.LatLng(coords.nELat, coords.nELng);
      return new google.maps.LatLngBounds(southWest, northEast);
    } else {
      return null;
    }
  },

  recordCoords: function(location, coords) {
    if(location) {
      var lat = location.lat;
      var lng = location.lon;
      coords.sWLat = (coords.sWLat == null ? lat : Math.min(coords.sWLat, lat));
      coords.sWLng = (coords.sWLng == null ? lng : Math.min(coords.sWLng, lng));
      coords.nELat = (coords.nELat == null ? lat : Math.max(coords.nELat, lat));
      coords.nELng = (coords.nELng == null ? lng : Math.max(coords.nELng, lng));
    }

    return coords;
  },

  generateSteps: function(steps) {
    var googleSteps = [];

    for(i in steps) {
      var step = steps[i];
      var googleStep = {};

      googleStep.duration = step.duration;
      googleStep.instructions = step.instructions;
      googleStep.travel_mode = step.travel_mode;
      googleStep.path = [];

      if(step.start_location) {
        googleStep.start_location = new google.maps.LatLng(step.start_location.lat, step.start_location.lon);
        googleStep.path.push(googleStep.start_location);
      }
      if(step.end_location) {
        googleStep.end_location = new google.maps.LatLng(step.end_location.lat, step.end_location.lon);
        googleStep.path.push(googleStep.end_location);
      }

      googleSteps.push(googleStep);
    }

    return googleSteps;
  }
};

module.exports = GoogleDirectionsRoute;
