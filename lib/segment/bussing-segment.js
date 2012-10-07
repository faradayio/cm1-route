var _ = require('underscore'),
    Segment = require('../segment');

var BussingSegment = function(index, step) {
  this.init(index, step);
  this.busClass = 'city';
  this.mode = 'BUSSING';
}
BussingSegment.prototype = new Segment();

BussingSegment.busClasses = {
  city: {
    passengers: 9.178,
    speed: 21.1049,
    gasoline_intensity: 0.002696,
    diesel_intensity: 0.415883,
    cng_intensity: 0.133461,
    lng_intensity: 0.017641,
    lpg_intensity: 0.001576,
    methanol_intensity: 0.000894,
    biodiesel_intensity: 0.041163,
    air_conditioning_emission_factor:	0.010408,
  },
  regional: {
    passengers: 5.336,
    speed: 91.8935,
    gasoline_intensity: 0.0,
    diesel_intensity: 0.210564,
    cng_intensity: 0.0,
    lng_intensity: 0.0,
    lpg_intensity: 0.0,
    methanol_intensity: 0.0,
    biodiesel_intensity: 0.0,
    air_conditioning_emission_factor:	0.039445,
  }
};

BussingSegment.fuels = {
  Gasoline: {
    co2_emission_factor: 2.34183,
    ch4_emission_factor: 0.000507972,
    n2o_emission_factor: 0.00317009,
  },
  Diesel: {
    co2_emission_factor: 2.70219,
    ch4_emission_factor: 7.92248e-05,
    n2o_emission_factor: 0.000888809,
  },
  CNG: {
    co2_emission_factor: 1.81242,
    ch4_emission_factor: 0.0305404,
    n2o_emission_factor: 0.0324045,
  },
  LNG: {
    co2_emission_factor: 1.27178,
    ch4_emission_factor: 0.0305404,
    n2o_emission_factor: 0.0324045,
  },
  LPG: {
    co2_emission_factor: 1.48193,
    ch4_emission_factor: 0.00102526,
    n2o_emission_factor: 0.0324045,
  },
  Methanol: {
    co2_emission_factor: 1.09621,
    ch4_emission_factor: 0.00102526,
    n2o_emission_factor: 0.0324045,
  },
  Biodiesel: {
    co2_emission_factor: 0.0,
    ch4_emission_factor: 0.0000776714,
    n2o_emission_factor: 0.000925843
  }
};

BussingSegment.prototype.impacts = function() {
  var bus = BussingSegment.busClasses[this.busClass];

  if(!this.distance)
    this.distance = (this.duration / 3600.0) * railClassData.speed;

  var distancePerPassenger = (this.distance / bus.passengers),
      fuelUses = {
        Gasoline: ((distancePerPassenger * bus.gasoline_intensity)),
        Diesel: ((distancePerPassenger * bus.diesel_intensity)),
        CNG: ((distancePerPassenger * bus.cng_intensity)),
        LNG: ((distancePerPassenger * bus.lng_intensity)),
        LPG: ((distancePerPassenger * bus.lpg_intensity)),
        Methanol: ((distancePerPassenger * bus.methanol_intensity)),
        Biodiesel: ((distancePerPassenger * bus.biodiesel_intensity))
      },
      totalFuel = _.reduce(fuelUses, function(memo, v) { return memo + v; }, 0);

  var hfcEmissions = (distancePerPassenger * bus.air_conditioning_emission_factor);

  var n2oEmissions = 0,
      ch4Emissions = 0;
  if(totalFuel > 0) {
    n2oEmissions = _.reduce(BussingSegment.fuels, function(memo, fuel, name) {
      return memo + ((fuelUses[name] / totalFuel) * distancePerPassenger *
        BussingSegment.fuels[name].n2o_emission_factor);
    }, 0);
    ch4Emissions = _.reduce(BussingSegment.fuels, function(memo, fuel, name) {
      return memo + ((fuelUses[name] / totalFuel) * distancePerPassenger *
        BussingSegment.fuels[name].ch4_emission_factor);
    }, 0);
  }

  var co2Emissions = _.reduce(BussingSegment.fuels, function(memo, fuel, name) {
    return memo + (fuelUses[name] *
      BussingSegment.fuels[name].co2_emission_factor);
  }, 0);

  var carbon = ((co2Emissions + ch4Emissions) + n2oEmissions) + hfcEmissions;

  return {
    decisions: { carbon: { object: { value: carbon } } },
    carbon: carbon,
    methodology: ''
  };
};

module.exports = BussingSegment;
