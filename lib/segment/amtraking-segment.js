var RailSegment = require('./rail-segment');

var AmtrakingSegment = function(index, step) {
  this.init(index, step);
  this.railClass = 'intercity';
}
AmtrakingSegment.prototype = new RailSegment();

module.exports = AmtrakingSegment;
