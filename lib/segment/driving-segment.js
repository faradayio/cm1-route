var CM1 = require('CM1'),
    Segment = require('../segment');

var DrivingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.mode = 'DRIVING';
}
DrivingSegment.prototype = new Segment();

CM1.extend(DrivingSegment, {
  model: 'automobile_trip',
  provides: ['distance']
});
