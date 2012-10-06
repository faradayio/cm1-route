var _ = require('underscore'),
    Segment = require('../segment');

var FlyingSegment = module.exports = function(index, step) {
  this.init(index, step);
  this.trips = 1;
  this.mode = 'FLYING';
};
FlyingSegment.prototype = new Segment();

FlyingSegment.seatClassMultiplier = function(seatClass, distance) {
  if(distance <= 1108.0) {
    if(seatClass == 'economy')
      return 0.9532;
    else
      return 1.4293;
  } else {
    if(seatClass == 'economy')
      return 0.7297;
    else
      return 2.1157;
  }
};

FlyingSegment.prototype.impacts = function() {
  if(!this.seatClassName)
    this.seatClassName = 'economy';

  var segmentsPerTrip = 1.68,
      freightShare = 0.06737155265215397,
      loadFactor = 0.7738993888651715,
      seats = 168.17077936330048,
      passengers = Math.round(seats * loadFactor),
      fuelDensity = 0.8156,
      doglegFactor = 1.1638548181950328,
      routeInefficiencyFactor = 1.100000023841858,
      adjustedDistance = this.distance * routeInefficiencyFactor * doglegFactor,
      adjustedDistancePerSegment = adjustedDistance / segmentsPerTrip,
      seatMultiplier = FlyingSegment.seatClassMultiplier(this.seatClassName, this.distance);

  var b = 1377.21495860357,
      m1 = 6.20891606683147,
      m2 = -0.000244465500968432,
      m3 = 0.000000125242803642,
      fuelPerSegment =
        (m3 * Math.pow(adjustedDistancePerSegment,3)) +
        (m2 * Math.pow(adjustedDistancePerSegment,2)) +
        (m1 * adjustedDistancePerSegment) + b;

  var fuelUse = ((((fuelPerSegment * segmentsPerTrip) * (1 - freightShare)) / passengers) * seatMultiplier) / fuelDensity;

  var ghgEmissionFactor = 5.15214,
      carbon = fuelUse * ghgEmissionFactor;

  return {
    decisions: { carbon: { object: { value: carbon } } },
    carbon: carbon,
    methodology: ''
  };
};

module.exports = FlyingSegment;
