if(!process.env) process.env = {};

var DirectionsFactory = require('./directions-factory'),
    FlyingDirections = require('./directions/flying-directions'),
    GoogleDirections = require('./directions/google-directions'),
    HopStopDirections = require('./directions/hop-stop-directions');

var Cm1Route = module.exports = {
  NumberFormatter: require('./number-formatter'),
  DirectionsFactory: DirectionsFactory,
  FlyingDirections: FlyingDirections,
  GoogleDirections: GoogleDirections,
  HopStopDirections: HopStopDirections,

  // Get driving directions and associated emissions
  drive: function(origin, destination, callback) {
    var directions = new GoogleDirections(origin, destination, 'DRIVING');
    directions.routeWithEmissions(Directions.events.translateRouteCallback(callback));
  },

  // Get flying directions and associated emissions
  flight: function(origin, destination, callback) {
    var directions = new FlyingDirections(origin, destination);
    directions.routeWithEmissions(Directions.events.translateRouteCallback(callback));
  },

  // Get transit (bus, rail) directions and associated emissions
  transit: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'PUBLICTRANSIT', when);
    directions.routeWithEmissions(Directions.events.translateRouteCallback(callback));
  },

  rail: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'SUBWAYING', when);
    directions.routeWithEmissions(HopStopDirections.events.transitRailFallbackCallback(callback));
  },

  bus: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'BUSSING', when);
    directions.routeWithEmissions(HopStopDirections.events.transitBusFallbackCallback(callback));
  }
};
