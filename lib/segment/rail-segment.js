var Segment = require('../segment');

var RailSegment = function() {};
RailSegment.prototype = new Segment();

RailSegment.railClasses = {
  commuter: {
    co2EmissionFactor: 0.1263,
    speed: 50.2
  },
  heavy: {
    co2EmissionFactor: 0.1024,
    speed: 32.7
  },
  intercity: {
    co2EmissionFactor: 0.1115,
    speed: 53.0
  },
  light: {
    co2EmissionFactor: 0.1487,
    speed: 24.4
  },
  fallback: {
    co2EmissionFactor: 0.061902649191816324,
    speed: 32.49720001220703
  }
}

RailSegment.prototype.impacts = function() {
  if(!this.railClass)
    this.railClass = 'fallback';
  var railClassData = RailSegment.railClasses[this.railClass];

  if(!this.distance)
    this.distance = (duration / 3600.0) * railClassData.speed;

  var carbon = this.distance * railClassData.co2EmissionFactor;

  return {
    decisions: { carbon: { object: { value: carbon } } },
    carbon: carbon,
    methodology: ''
  };
};

module.exports = RailSegment;
