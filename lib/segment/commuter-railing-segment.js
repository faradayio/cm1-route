var RailSegment = require('./rail-segment');

var CommuterRailingSegment = function(index, step) {
  this.init(index, step);
  this.railClass = 'commuter';
}
CommuterRailingSegment.prototype = new RailSegment();

module.exports = CommuterRailingSegment;
