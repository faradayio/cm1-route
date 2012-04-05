var CM1 = require('CM1'),
    Segment = require('../segment');

var AmtrakingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.rail_class = 'intercity rail';
}
AmtrakingSegment.prototype = new Segment();

CM1.extend(AmtrakingSegment, {
  model: 'rail_trip',
  provides: ['distance', 'rail_class']
});
