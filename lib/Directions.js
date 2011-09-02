var SegmentFactory = require('./segment-factory'),
    TimeFormatter = require('./time-formatter');

var Directions = module.exports = function(origin, destination, mode) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode;
  this.directionsResult = null;
  this.segmentEmissionsSuccessCount = 0;
};

Directions.events = new DirectionsEvents();

Directions.prototype.steps = function(index) {
  if(!this._steps && this.directionsResult) {
    this._steps = this.directionsResult.routes[0].legs[0].steps
  }

  return this._steps
}

Directions.prototype.segments = function() {
  if(!this._segments) {
    var list = [];
    for(var i = 0; i < this.steps().length; i++) {
      var step = this.steps()[i];
      list[i] = SegmentFactory.create(i, step);
    }
    this._segments = list;
  }

  return this._segments;
};

Directions.prototype.eachSegment = function(lambda) {
  for(var i = 0; i < this.segments().length; i++) {
    lambda(this.segments()[i]);
  }
};

Directions.prototype.getEmissions = function(onSuccess, onError, onFinish) {
  var onSuccessWithTotalEmissionUpdate = Directions.events.onSegmentEmissionsSuccess(this, onSuccess, onFinish);
  this.totalEmissions = 0.0;
  this.segmentEmissionsSuccessCount = 0;
  this.eachSegment(function(segment) {
    segment.getEmissionEstimateWithSegment(onSuccessWithTotalEmissionUpdate, onError);
  });
};

Directions.prototype.totalTime = function() {
  var totalTime = 0;
  this.eachSegment(function(segment) {
    totalTime += segment.duration;
  });
  return TimeFormatter.format(totalTime);
};

Directions.prototype.routeWithEmissions = function(callback) {
  //async.series([
    //this.route(),
    //this.getEmissions()
  //]);
  this.route(onSuccess, onFailure);
};
