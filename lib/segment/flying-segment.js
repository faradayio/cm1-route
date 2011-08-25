var CM1 = require('CM1'),
    Segment = require('../segment');

var FlyingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  this.instructions = step.instructions;
  this.trips = 1;
  this.mode = 'FLYING';
}
FlyingSegment.prototype = new Segment();

CM1.emitter(FlyingSegment, function(emitter) {
  emitter.emitAs('flight');
  emitter.provide('distance', { as: 'distance_estimate' });
  emitter.provide('trips');
});
