var CM1 = require('CM1'),
    Segment = require('../segment');

var WalkingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.mode = 'WALKING';
};
WalkingSegment.prototype = new Segment();

WalkingSegment.prototype.getImpacts = function(callback) {
  var estimate = new CM1.ImpactEstimate(this, {
    decisions: { carbon: { object: { value: 0 } } },
    methodology: ''
  });
  callback(null, estimate);
};
