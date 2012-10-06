var _ = require('underscore'),
    Segment = require('../segment');

var DrivingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.mode = 'DRIVING';
}
DrivingSegment.prototype = new Segment();

DrivingSegment.prototype.impacts = function() {
  if(!this.fuelEfficiency)
    this.fuelEfficiency = 8.226530750610781;

  var fuelUse = this.distance / this.fuelEfficiency,
      hfcEmissionFactor = 0.0103728,
      n2oEmissionFactor = 0.005664996525124796,
      ch4EmissionFactor = 0.0004202975765289705,
      co2EmissionFactor = 2.346369068584911,
      hfcEmissions = this.distance * hfcEmissionFactor,
      n2oEmissions = this.distance * n2oEmissionFactor,
      ch4Emissions = this.distance * ch4EmissionFactor,
      co2Emissions = fuelUse * co2EmissionFactor;

  var carbon = co2Emissions + ch4Emissions + n2oEmissions + hfcEmissions;

  return {
    decisions: { carbon: { object: { value: carbon } } },
    carbon: carbon,
    methodology: ''
  };
};

module.exports = DrivingSegment;
