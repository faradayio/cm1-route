var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter');

var async = require('async'),
    googleMaps = require('googlemaps');

var FlyingDirections = module.exports = function(origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'FLYING';
  this.geocoder = new google.maps.Geocoder();
}
FlyingDirections.prototype = new Directions();

FlyingDirections.events = new DirectionsEvents;

FlyingDirections.prototype.route = function (callback) {
  async.parallel({
    origin: FlyingDirections.events.geocode(this, this.origin, 'originLatLng'),
    destination: FlyingDirections.events.geocode(this, this.destination, 'destinationLatLng')
  }, FlyingDirections.events.onGeocodeFinish(this, callback));
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

FlyingDirections.prototype.isLongEnough = function() {
  return this.distanceEstimate() > 115000;
};


// Events

FlyingDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) return callback(err);
    if(!directions.isLongEnough()) return callback(new Error("Route isn't long enough for a flight"));

    var steps = [{
      travel_mode: 'FLYING',
      distance: { value: directions.distanceEstimate() },
      duration: { value: directions.duration() },
      instructions: NumberFormatter.metersToMiles(directions.distanceEstimate()) + ' mile flight',
      start_position: {
        lat: directions.originLatLng.lat(),
        lon: directions.originLatLng.lng()
      },
      end_position: {
        lat: directions.destinationLatLng.lat(),
        lon: directions.destinationLatLng.lng()
      }
    }];

    var directionsResult = { routes: [{
      legs: [{
        duration: { value: directions.duration() },
        distance: { value: directions.distanceEstimate() },
        steps: steps
      }],
      warnings: [],
      bounds: GoogleDirectionsRoute.generateBounds(steps)
    }]};
    directions.storeRoute(directionsResult);

    callback(null, directions);
  };
};
