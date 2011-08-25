var Segment = require('../segment');

var HopStopSegment = module.exports = function() {}
HopStopSegment.prototype = Segment.prototype;

HopStopSegment.prototype.durationInMinutes = function() {
  if(this.duration)
    return this.duration / 60;
};
