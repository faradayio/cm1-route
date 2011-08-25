var CM1 = require('CM1'),
    Segment = require('../segment');

var WalkingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'WALKING';
};
WalkingSegment.prototype = new Segment();

WalkingSegment.prototype.getEmissionEstimate = function(onSuccess, onError) {
  var estimate = new CM1.EmissionEstimate();
  estimate.data = {
    emission: 0
  };
  estimate.methodology = null;
  onSuccess(estimate);
};
