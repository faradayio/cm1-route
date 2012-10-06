var RailSegment = require('./rail-segment');

var LightRailingSegment = function(index, step) {
  this.init(index, step);
  this.railClass = 'light';
}
LightRailingSegment.prototype = new RailSegment();

module.exports = LightRailingSegment;
