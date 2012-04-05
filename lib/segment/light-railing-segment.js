var CM1 = require('CM1'),
    Segment = require('../segment');

var LightRailingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.rail_class = 'light rail';
}
LightRailingSegment.prototype = new Segment();

CM1.extend(LightRailingSegment, {
  model: 'rail_trip',
  provides: ['duration', 'rail_class', { 'distance_estimate': 'distance' }]
});
