var CM1 = require('CM1'),
    Segment = require('../segment');

var BussingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.bus_class = 'city transit';
  this.mode = 'BUSSING';
}
BussingSegment.prototype = new Segment();

CM1.extend(BussingSegment, {
  model: 'bus_trip',
  provides: ['distance', 'bus_class', 'duration']
});
