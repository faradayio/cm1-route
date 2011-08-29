var Segment = require('../segment');

var HopStopSegment = module.exports = function() {};
HopStopSegment.prototype = new Segment();

HopStopSegment.prototype.durationInMinutes = function() {
  if(this.duration)
    return this.duration / 60;
};
