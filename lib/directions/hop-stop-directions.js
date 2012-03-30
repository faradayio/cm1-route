var _ = require('underscore');

var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    DirectBusDirections = require('./direct-bus-directions'),
    DirectRailDirections = require('./direct-rail-directions'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    HootrootApi = require('../hootroot-api'),
    WalkingSegment = require('../segment/walking-segment');
var async = require('async');

var HopStopDirections = function(origin, destination, mode, when) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode || 'PUBLICTRANSIT';
  this.when = when || 'now';
  this.geocoder = new google.maps.Geocoder();
  this.parameters = {};
}
HopStopDirections.prototype = new Directions;

HopStopDirections.AllWalkingSegmentsError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'AllWalkingSegmentsError';
  this.message = (message) ? message : 'All segments are walking segments';
};

HopStopDirections.events = new DirectionsEvents();

HopStopDirections.shouldDefaultTransitToDirectRoute = function(err) {
  err = err ? err : false;
  var walkingError = (err && err.name == 'AllWalkingSegmentsError');
  return (walkingError && process.env.TRANSIT_DIRECT_DEFAULT.toString() == 'true');
};

HopStopDirections.prototype.route = function(callback) {
  var directions = this;

  if(this.mode == 'SUBWAYING')
    callback = HopStopDirections.events.railFallbackCallback(callback);
  else if(this.mode == 'BUSSING')
    callback = HopStopDirections.events.busFallbackCallback(callback);

  async.parallel({
    origin: HopStopDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: HopStopDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, function(err, geocodes) {
    if(err) callback(err, directions);

    directions.fetchHopStop(callback);
  });
};

HopStopDirections.prototype.params = function() {
  return {
    x1: this.originLatLng.lng(), 
    y1: this.originLatLng.lat(), 
    x2: this.destinationLatLng.lng(), 
    y2: this.destinationLatLng.lat(), 
    mode: this.mode,
    when: this.when
  };
};

HopStopDirections.prototype.fetchHopStop = function(callback) {
  HootrootApi.hopstop(this.params(),
    HopStopDirections.events.processHopStop(this, callback));
};

HopStopDirections.prototype.calculateDistance = function() {
  this.distanceInMeters = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
  this.distance = this.distanceInMeters / 1000;
};

HopStopDirections.translateRoute = function(hopstopData) {
  var route = {
    hopstopData: hopstopData,
    copyrights: 'Copyright HopStop.com, Inc.',
    overview_path: HopStopDirections.generateOverviewPath(hopstopData.steps)
  };
  route.legs = [{
    duration: { value: hopstopData.duration },
    start_address: '',
    start_location: route.overview_path[0],
    end_address: '',
    end_location: route.overview_path[route.overview_path.length - 1],
    steps: HopStopDirections.generateGoogleSteps(hopstopData.steps),
    via_waypoints: []
  }];
  route.warnings = [];
  route.bounds = GoogleDirectionsRoute.generateBounds(route.overview_path);

  return { routes: [route] };
};

HopStopDirections.generateOverviewPath = function(steps) {
  var path = [];
  _.each(steps, function(step) {
    if(step.start_location) {
      var startLatLng = new google.maps.LatLng(
        step.start_location.lat, step.start_location.lon );
      path.push(startLatLng);
      var endLatLng = new google.maps.LatLng(
          step.end_location.lat, step.end_location.lon);
      path.push(endLatLng);
    }
  });

  return path;
};

HopStopDirections.generateGoogleSteps = function(steps) {
  var googleSteps = [];

  _.each(steps, function(step) {
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
  });

  return googleSteps;
};


// Events

HopStopDirections.events.processHopStop = function(directions, callback) {
  return function(err, results) {
    if(err) return callback(err, directions);

    directions.storeRoute(HopStopDirections.translateRoute(results));

    err = null;
    if(directions.isAllWalkingSegments()) {
      err = new HopStopDirections.AllWalkingSegmentsError('Invalid Hopstop route: all segments are walking segments');
    }
    callback(err, directions);
  };
};

HopStopDirections.events.railFallbackCallback = function(callback) {
  return function(err, hopStopDirections) {
    if(HopStopDirections.shouldDefaultTransitToDirectRoute(err)) {
      console.log('falling back to direct rail');
      var directDirections = new DirectRailDirections(
          hopStopDirections.origin, hopStopDirections.destination);
      directDirections.route(
        HopStopDirections.events.copyRoutedDirections(hopStopDirections, callback));
    } else {
      callback(err, hopStopDirections);
    }
  };
};

HopStopDirections.events.busFallbackCallback = function(callback) {
  return function(err, hopStopDirections) {
    if(HopStopDirections.shouldDefaultTransitToDirectRoute(err)) {
      console.log('falling back to google directions for bus');
      var drivingDirections = new DirectBusDirections(
          hopStopDirections.origin, hopStopDirections.destination);
      drivingDirections.route(
        HopStopDirections.events.copyRoutedDirections(hopStopDirections, callback));
    } else {
      callback(err, hopStopDirections);
    }
  };
};

HopStopDirections.events.copyRoutedDirections = function(originalDirections, callback) {
  return function(err, newDirections) {
    if(err) return callback(err, newDirections);

    originalDirections.storeRoute(newDirections.directionsResult);
    callback(null, originalDirections);
  };
};

module.exports = HopStopDirections;
