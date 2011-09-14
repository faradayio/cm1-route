var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter'),
    TimeFormatter = require('../time-formatter');

var async = require('async');

var FlyingDirections = module.exports = function(origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'FLYING';
  this.geocoder = new google.maps.Geocoder();
  this.geocodeOrigin = Directions.events.geocode(this, 'origin', 'originLatLng');
  this.geocodeDestination = Directions.events.geocode(this, 'destination', 'destinationLatLng');
  this.parameters = {};
}
FlyingDirections.prototype = new Directions();

FlyingDirections.RouteTooShortError = function (message) {  
  this.prototype = Error.prototype;  
  this.name = 'RouteTooShortError';  
  this.message = (message) ? message : "Route isn't long enough for a flight";  
};

FlyingDirections.events = new DirectionsEvents;

FlyingDirections.prototype.route = function (callback) {
  async.parallel({
    origin: FlyingDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: FlyingDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, FlyingDirections.events.onGeocodeFinish(this, callback));
};

FlyingDirections.prototype.calculateDistance = function() {
  this.distanceInMeters = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
  this.distance = this.distanceInMeters / 1000;
};

FlyingDirections.prototype.duration = function() {
  var rate = 0.0056818;  // that's like 400mph
  return rate * this.distance;
}

FlyingDirections.prototype.totalTime = function() {
  return TimeFormatter.format(this.duration());
};

FlyingDirections.prototype.isLongEnough = function() {
  return this.distance > 115;
};


// Events

FlyingDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) return callback(err, directions);

    directions.calculateDistance();

    if(!directions.isLongEnough())
      return callback(new FlyingDirections.RouteTooShortError, directions);

    var steps = [{
      travel_mode: 'FLYING',
      distance: { value: directions.distanceInMeters },
      duration: { value: directions.duration() },
      instructions: NumberFormatter.metersToMiles(directions.distance) + ' mile flight',
      start_location: directions.originLatLng,
      end_location: directions.destinationLatLng
    }];

    var directionsResult = { routes: [{
      legs: [{
        duration: { value: directions.duration() },
        distance: { value: directions.distanceInMeters },
        steps: steps
      }],
      warnings: [],
      bounds: GoogleDirectionsRoute.generateBounds(steps)
    }]};
    directions.storeRoute(directionsResult);

    callback(null, directions);
  };
};
