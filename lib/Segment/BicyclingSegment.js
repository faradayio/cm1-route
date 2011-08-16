function BicyclingSegment(index, step) {
  this.index = index;
  this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'BICYCLING';
}
BicyclingSegment.prototype = new Segment();

BicyclingSegment.prototype.getEmissionEstimate = function(onSuccess, onError) {
  var estimate = new EmissionEstimate();
  estimate.data = {
    emission: 0
  };
  estimate.methodology = null;
  onSuccess(estimate);
};
