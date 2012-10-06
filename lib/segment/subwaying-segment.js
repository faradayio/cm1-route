var RailSegment = require('./rail-segment');

var SubwayingSegment = function(index, step) {
  this.init(index, step);
  this.railClass = 'heavy';
  this.mode = 'SUBWAYING';
}
SubwayingSegment.prototype = new RailSegment();

module.exports = SubwayingSegment;
