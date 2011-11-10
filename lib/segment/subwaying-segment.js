var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var SubwayingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'heavy rail';
  this.mode = 'SUBWAYING';
}
SubwayingSegment.prototype = new HopStopSegment();

CM1.extend(SubwayingSegment, {
  model: 'rail_trip',
  provides: ['duration', 'rail_class', { 'distance': 'distance_estimate' }]
});
