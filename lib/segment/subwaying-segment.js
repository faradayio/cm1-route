var CM1 = require('CM1'),
    Segment = require('../segment');

var SubwayingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.rail_class = 'heavy rail';
  this.mode = 'SUBWAYING';
}
SubwayingSegment.prototype = new Segment();

CM1.extend(SubwayingSegment, {
  model: 'rail_trip',
  provides: ['rail_class', 'distance']
});
