var CM1 = require('CM1'),
    Segment = require('../segment');

var CommuterRailingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.rail_class = 'commuter rail';
}
CommuterRailingSegment.prototype = new Segment();

CM1.extend(CommuterRailingSegment, {
  model: 'rail_trip',
  provides: ['distance', 'rail_class']
});
