var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var BussingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.bus_class = 'city transit';
  this.mode = 'BUSSING';
}
BussingSegment.prototype = new HopStopSegment();

CM1.extend(BussingSegment, {
  model: 'bus_trip',
  provides: ['distance', 'bus_class', { 'duration': 'durationInMinutes' }]
});
