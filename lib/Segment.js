var Segment = function() {};

Segment.prototype.init = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  if(step.travel_mode)
    this.travel_mode = step.travel_mode;
  this.instructions = step.instructions;
};

module.exports = Segment;
