var Segment = require('../segment');

var WalkingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.mode = 'WALKING';
};
WalkingSegment.prototype = new Segment();

WalkingSegment.prototype.impacts = function() {
  return {
    decisions: { carbon: { object: { value: 0 } } },
    carbon: 0,
    methodology: ''
  };
};
