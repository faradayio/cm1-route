var Directions = require('../directions'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter');

var googleMaps = require('googlemaps');

var FlyingDirections = module.exports = function(origin, destination, mode) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'FLYING';
}
FlyingDirections.prototype = new Directions();

FlyingDirections.prototype.route = function (onSuccess, onError) {
  googleMaps.geocode({ address: this.origin },
      FlyingDirections.events.onGeocodeOriginSuccess(onSuccess, onError));
  googleMaps.geocode({ address: this.destination },
      FlyingDirections.events.onGeocodeDestinationSuccess(onSuccess, onError));
};

FlyingDirections.prototype.steps = function() {
  return [{
    travel_mode: 'FLYING',
    distance: { value: this.distanceEstimate() },
    duration: { value: this.duration() },
    instructions: NumberFormatter.metersToMiles(this.distanceEstimate()) + ' mile flight',
    start_position: {
      lat: this.originLatLng.lat(),
      lon: this.originLatLng.lng()
    },
    end_position: {
      lat: this.destinationLatLng.lat(),
      lon: this.destinationLatLng.lng()
    }
  }];
};

FlyingDirections.prototype.distanceEstimate = function() {
  if(!this._distanceEstimate) {
    this._distanceEstimate = google.maps.geometry.spherical.computeDistanceBetween(
      this.originLatLng, this.destinationLatLng);
  }
  return this._distanceEstimate;
};

FlyingDirections.prototype.duration = function() {
  var rate = 0.0056818;  // that's like 400mph
  return rate * this.distanceEstimate();
}

FlyingDirections.prototype.totalTime = function() {
  return TimeFormatter.format(this.duration());
};

FlyingDirections.prototype.isFullyGeocoded = function() {
  return this.originLatLng != null && this.destinationLatLng != null;
};

FlyingDirections.prototype.isLongEnough = function() {
  return this.distanceEstimate() > 115000;
};


// Events

FlyingDirections.events = {
  onGeocodeOriginSuccess: function(directions, onSuccess, onError) {
    return function(geocode) {
      directions.originLatLng = geocode[0].geometry.location;
      FlyingDirections.events.onGeocodeSuccess(directions, onSuccess, onError);
    };
  },
  onGeocodeDestinationSuccess: function(directions, onSuccess, onError) {
    return function(geocode) {
      directions.destinationLatLng = geocode[0].geometry.location;
      FlyingDirections.events.onGeocodeSuccess(directions, onSuccess, onError);
    };
  },
  onGeocodeSuccess: function(directions, onSuccess, onError) {
    if(directions.isFullyGeocoded()) {
      directions.directionsResult = { routes: {
        legs: [{
          duration: { value: directions.duration() },
          distance: { value: directions.distanceEstimate() },
          steps: directions.steps(),
        }],
        warnings: [],
        bounds: GoogleDirectionsRoute.generateBounds(directions.steps())
      }};
      if(directions.isLongEnough()) {
        onSuccess(directions, directions.directionsResult);
      } else {
        onError(directions, directions.directionsResult);
      }
    }
  }
};
