var CM1 = require('CM1'),
    Segment = require('../segment');

var BicyclingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.mode = 'BICYCLING';
}
BicyclingSegment.prototype = new Segment();

BicyclingSegment.prototype.getImpacts = function(callback) {
  var estimate = new CM1.ImpactEstimate(this, {
    decisions: { carbon: { object: { value: 0 } } },
    methodology: ''
  });
  callback(null, estimate);
};
