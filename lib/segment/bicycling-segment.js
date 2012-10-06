var Segment = require('../segment');

var BicyclingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.mode = 'BICYCLING';
}
BicyclingSegment.prototype = new Segment();

BicyclingSegment.impacts = function() {
  return {
    decisions: { carbon: { object: { value: 0 } } },
    carbon: 0,
    methodology: ''
  };
};
