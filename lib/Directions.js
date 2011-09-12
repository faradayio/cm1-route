var async = require('async');

var DirectionsEvents = require('./directions-events'),
    FootprintedRoute = require('./footprinted-route'),
    SegmentFactory = require('./segment-factory'),
    TimeFormatter = require('./time-formatter');

var Directions = module.exports = function(origin, destination, mode) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode;
};

Directions.events = new DirectionsEvents();

Directions.prototype.storeRoute = function(result) {
  this.directionsResult = result;
  this.steps = result.routes[0].legs[0].steps;
  this.segments = [];
  for(var i = 0; i < this.steps.length; i++) {
    var step = this.steps[i];
    this.segments.push(SegmentFactory.create(i, step));
  }
  this.calculateDistance();
};

Directions.prototype.eachSegment = function(lambda) {
  if(!this.segments) throw new Error("Directions haven't been routed yet.");
  for(var i = 0; i < this.segments.length; i++) {
    lambda(this.segments[i]);
  }
};

Directions.prototype.getEmissions = function(callback, segmentCallback) {
  this.totalEmissions = 0.0;
  directions = this;

  if(this.segments.length > 0) {
    this.getEmissionsFromSegments(callback, segmentCallback);
  } else if(this.distance) {
    this.getEmissionsFromDistance(callback, segmentCallback);
  }
};

Directions.prototype.getEmissionsFromSegments = function(callback, segmentCallback) {
  async.forEach(
    this.segments,
    function(segment, asyncCallback) {
      segment.getEmissionEstimate(
        Directions.events.onSegmentGetEmissionEstimate(directions, segmentCallback, asyncCallback));
    },
    function(err) {
      callback(err, directions);
    }
  );
};

Directions.prototype.getEmissionsFromDistance = function(callback, segmentCallback) {
  this.segments = [SegmentFactory.create(0, {
    travel_mode: this.mode,
    distance: { value: this.distance },
    this.instructions = 'travel ' + this.distance + ' meters';
  })];

  this.getEmissions(callback, segmentCallback);
};

Directions.prototype.totalTime = function() {
  var totalTime = 0;
  this.eachSegment(function(segment) {
    totalTime += segment.duration;
  });
  return TimeFormatter.format(totalTime);
};

Directions.prototype.routeWithEmissions = function(callback) {
  var directions = this;

  async.series([
    function(asyncCallback) { directions.route(asyncCallback); },
    function(asyncCallback) { directions.getEmissions(asyncCallback); }
  ], function(err) {
    var func = Directions.events.translateRouteCallback(callback);
    func(err, directions);
  });
};
