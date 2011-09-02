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

FlyingDirections.prototype.isLongEnough = function() {
  return this.distanceEstimate() > 115000;
};


// Events

FlyingDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) callback(err);

    directions.directionsResult = { routes: {
      legs: [{
        duration: { value: directions.duration() },
        distance: { value: directions.distanceEstimate() },
        steps: directions.steps(),
      }],
      warnings: [],
      bounds: GoogleDirectionsRoute.generateBounds(directions.steps())
    }};

    var err = null; 
    if(!directions.isLongEnough()) {
      var err = new Error("Route isn't long enough for a flight");
    }
    callback(err, directions);
  };
};
