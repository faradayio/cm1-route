var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter');

var async = require('async');

var DirectBusDirections = function(origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'BUSSING';
  this.geocoder = new google.maps.Geocoder();
  this.parameters = {};
}
DirectBusDirections.prototype = new Directions();

DirectBusDirections.events = new DirectionsEvents;

DirectBusDirections.prototype.route = function (callback) {
  async.parallel({
    origin: DirectBusDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: DirectBusDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, DirectBusDirections.events.onGeocodeFinish(this, callback));
};

DirectBusDirections.prototype.calculateDistance = function() {
  this.distanceInMeters = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
  this.distance = this.distanceInMeters / 1000;
};

DirectBusDirections.prototype.duration = function() {
  var rate = 0.0008067;  // that's like 55mph
  return rate * this.distance;
};

DirectBusDirections.prototype.totalTime = function() {
  return TimeFormatter.format(this.duration());
};


// Events

DirectBusDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) return callback(err, directions);

    directions.calculateDistance();

    var steps = [{
      travel_mode: 'BUSSING',
      distance: { value: directions.distanceInMeters },
      duration: { value: directions.duration() },
      instructions: NumberFormatter.metersToMiles(directions.distanceInMeters) + ' mile bus trip',
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

module.exports = DirectBusDirections;
