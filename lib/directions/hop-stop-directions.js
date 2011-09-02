var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    HootrootApi = require('../hootroot-api'),
    WalkingSegment = require('../segment/walking-segment');
var async = require('async'),
    http = require('http');

var HopStopDirections = module.exports = function(origin, destination, mode, when) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode || 'PUBLICTRANSIT';
  this.when = when || 'now';
  this.geocoder = new google.maps.Geocoder();
}
HopStopDirections.prototype = new Directions;

HopStopDirections.events = new DirectionsEvents();

HopStopDirections.prototype.route = function(callback) {
  var directions = this;
  async.parallel({
    origin: HopStopDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: HopStopDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, function(err, geocodes) {
    if(err) {
      callback(err, directions);
    } else {
      async.series({
        hopstop: HopStopDirections.events.fetchHopStop(directions),
      }, HopStopDirections.events.processHopStop(directions, callback));
    }
  });
};

HopStopDirections.prototype.isAllWalkingSegments = function() {
  var result = true;
  this.eachSegment(function(segment) {
    result = result && segment instanceof WalkingSegment;
  });
  return result;
};

HopStopDirections.prototype.calculateDistance = function() {
  this.distance = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
};


// Events

HopStopDirections.events.fetchHopStop = function(directions) {
  return function(callback) {
    var params = {
      x1: directions.originLatLng.lng(), 
      y1: directions.originLatLng.lat(), 
      x2: directions.destinationLatLng.lng(), 
      y2: directions.destinationLatLng.lat(), 
      mode: directions.mode,
      when: directions.when
    };

    HootrootApi.hopstop(params, callback);
  };
};

HopStopDirections.events.processHopStop = function(directions, callback) {
  return function(err, results) {
    if(err) {
      callback(err, directions);
    } else {
      var directionsResult = { routes: [new GoogleDirectionsRoute(results.hopstop)] };
      directions.storeRoute(directionsResult);

      err = null;
      if(directions.isAllWalkingSegments()) {
        err = new Error('Invalid Hopstop route: all segments are walking segments');
      }
      callback(err, directions);
    }
  };
};
