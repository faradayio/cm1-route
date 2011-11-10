var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var AmtrakingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'intercity rail';
}
AmtrakingSegment.prototype = new HopStopSegment();

CM1.extend(AmtrakingSegment, {
  model: 'rail_trip',
  provides: ['duration', 'rail_class', { 'distance': 'distance_estimate' }]
});
