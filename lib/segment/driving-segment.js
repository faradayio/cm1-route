var CM1 = require('CM1'),
    Segment = require('../segment');

var DrivingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'DRIVING';
}
DrivingSegment.prototype = new Segment();

CM1.emitter(DrivingSegment, function(emitter) {
  emitter.emitAs('automobile_trip');
  emitter.provide('distance');
});
