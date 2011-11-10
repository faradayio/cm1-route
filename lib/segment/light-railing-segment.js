var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var LightRailingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'light rail';
}
LightRailingSegment.prototype = new HopStopSegment();

CM1.extend(LightRailingSegment, {
  model: 'rail_trip',
  provides: ['duration', 'rail_class', { 'distance_estimate': 'distance' }]
});
