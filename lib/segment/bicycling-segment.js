var CM1 = require('CM1'),
    Segment = require('../segment');

var BicyclingSegment = module.exports = function(index, step) {
  this.index = index;
  this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'BICYCLING';
}
BicyclingSegment.prototype = new Segment();

BicyclingSegment.prototype.getImpacts = function(callback) {
  var estimate = new CM1.ImpactEstimate(this, {
    decisions: { carbon: { object: { value: 0 } } },
    methodology: ''
  });
  callback(null, estimate);
};
