var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var CommuterRailingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'commuter rail';
}
CommuterRailingSegment.prototype = new HopStopSegment();

CM1.extend(CommuterRailingSegment, {
  model: 'rail_trip',
  provides: ['duration', 'rail_class', { 'distance_estimate': 'distance' }]
});
