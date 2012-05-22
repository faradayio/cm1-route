var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter');

var async = require('async');

var DirectRailDirections = function(origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'SUBWAYING';
  this.geocoder = new google.maps.Geocoder();
  this.parameters = {};
}
DirectRailDirections.prototype = new Directions();

DirectRailDirections.events = new DirectionsEvents;

DirectRailDirections.prototype.route = function (callback) {
  async.parallel({
    origin: DirectRailDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: DirectRailDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, DirectRailDirections.events.onGeocodeFinish(this, callback));
};

DirectRailDirections.prototype.calculateDistance = function() {
  this.distanceInMeters = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
  this.distance = this.distanceInMeters / 1000;
};

DirectRailDirections.prototype.duration = function() {
  var rate = 0.0011;  // that's like 75mph
  return rate * this.distance;
}

DirectRailDirections.prototype.totalTime = function() {
  return TimeFormatter.format(this.duration());
};


// Events

DirectRailDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) return callback(err, directions);

    directions.calculateDistance();

    var steps = [{
      travel_mode: 'AMTRAKING',
      distance: { value: directions.distanceInMeters },
      duration: { value: directions.duration() },
      instructions: NumberFormatter.metersToMiles(directions.distance) + ' km rail trip',
      start_location: directions.originLatLng,
      end_location: directions.destinationLatLng
    }];

    var route = {
      overview_path: [directions.originLatLng, directions.destinationLatLng],
      legs: [{
        duration: { value: directions.duration() },
        distance: { value: directions.distanceInMeters },
        steps: steps
      }],
      warnings: []
    };
    route.bounds = GoogleDirectionsRoute.generateBounds(route.overview_path);

    var directionsResult = { routes: [route]};
    directions.storeRoute(directionsResult);

    callback(null, directions);
  };
};

module.exports = DirectRailDirections;
