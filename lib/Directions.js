var _ = require('underscore'),
    async = require('async');

var DirectionsEvents = require('./directions-events'),
    SegmentFactory = require('./segment-factory'),
    TimeFormatter = require('./time-formatter'),
    WalkingSegment = require('./segment/walking-segment');

var Directions = module.exports = function(origin, destination, mode) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode;
};

Directions.translateAirport = function(locale) {
  if(/^[A-Za-z]{3}$/.test(locale))
    return locale + ' Airport';
  else
    return locale;
};

Directions.events = new DirectionsEvents();

Directions.prototype.isRouted = function() {
  return (typeof this.directionsResult != 'undefined');
};

Directions.prototype.storeRoute = function(result) {
  this.directionsResult = result;
  this.steps = result.routes[0].legs[0].steps;
  this.segments = [];
  _.each(this.steps, function(step, i) {
    this.segments.push(SegmentFactory.create(i, step));
  }, this);
  if(this.calculateDistance)
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

  if(this.segments && this.segments.length > 0) {
    this.getEmissionsFromSegments(callback, segmentCallback);
  } else if(this.distance) {
    this.getEmissionsFromDistance(callback, segmentCallback);
  }
};

Directions.prototype.getEmissionsFromSegments = function(callback, segmentCallback) {
  var directions = this;
  async.forEach(
    this.segments,
    function(segment, asyncCallback) {
      segment.parameters = directions.parameters;
      segment.getImpacts(
        Directions.events.onSegmentGetEmissionEstimate(directions, segmentCallback, asyncCallback));
    },
    function(err) {
      callback(err, directions);
    }
  );
};

Directions.prototype.getEmissionsFromDistance = function(callback, segmentCallback) {
  var distanceInMeters = this.distance * 1000;
  this.segments = [SegmentFactory.create(0, {
    travel_mode: this.mode,
    distance: { value: distanceInMeters },
    instructions: 'travel ' + distanceInMeters + ' meters'
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

Directions.prototype.isAllWalkingSegments = function() {
  var result = true;
  this.eachSegment(function(segment) {
    result = result && segment instanceof WalkingSegment;
  });
  return result;
};
