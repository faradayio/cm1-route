var CM1 = require('CM1'),
    Segment = require('../segment');

var FlyingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.trips = 1;
  this.mode = 'FLYING';
}
FlyingSegment.prototype = new Segment();

CM1.extend(FlyingSegment, {
  model: 'flight',
  provides: ['trips', { 'distance_estimate': 'distance' }]
});
