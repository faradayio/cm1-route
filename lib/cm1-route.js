if(!process.env) process.env = {};

var DirectionsFactory = require('./directions-factory'),
    DirectRailDirections = require('./directions/direct-rail-directions'),
    FlyingDirections = require('./directions/flying-directions'),
    FootprintedRoute = require('./footprinted-route'),
    GoogleDirections = require('./directions/google-directions'),
    HopStopDirections = require('./directions/hop-stop-directions');

var Cm1Route = module.exports = {
  NumberFormatter: require('./number-formatter'),
  DirectionsFactory: DirectionsFactory,
  FlyingDirections: FlyingDirections,
  GoogleDirections: GoogleDirections,
  HopStopDirections: HopStopDirections,
  DirectRailDirections: DirectRailDirections,

  // Get driving directions and associated emissions
  drive: function(origin, destination, callback) {
    var directions = new GoogleDirections(origin, destination, 'DRIVING');
    directions.routeWithEmissions(events.translateRouteCallback(callback));
  },

  // Get flying directions and associated emissions
  flight: function(origin, destination, callback) {
    var directions = new FlyingDirections(origin, destination);
    directions.routeWithEmissions(events.translateRouteCallback(callback));
  },

  // Get transit (bus, rail) directions and associated emissions
  transit: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'PUBLICTRANSIT', when);
    directions.routeWithEmissions(events.transitRailFallbackCallback(callback));
  },

  rail: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'SUBWAYING', when);
    directions.routeWithEmissions(events.transitRailFallbackCallback(callback));
  },

  bus: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'BUSSING', when);
    directions.routeWithEmissions(events.transitRailFallbackCallback(callback));
  },

  shouldDefaultTransitToDirectRoute: function(err) {
    err = err ? err : false;
    var walkingError = (err && err.name == 'AllWalkingSegmentsError');
    return (walkingError && process.env.TRANSIT_DIRECT_DEFAULT.toString() == 'true');
  }
};

var events = {
  translateRouteCallback: function(callback) {
    return function(err, directions) {
      if(err) {
        callback(err);
      } else {
        callback(err, new FootprintedRoute(directions));
      }
    };
  },

  transitRailFallbackCallback: function(callback) {
    return function(err, hopStopDirections) {
      if(Cm1Route.shouldDefaultTransitToDirectRoute(err)) {
        console.log('falling back to direct rail');
        var directDirections = new DirectRailDirections(
            hopStopDirections.origin, hopStopDirections.destination);
        directDirections.routeWithEmissions(events.translateRouteCallback(callback));
      } else {
        callback(err, new FootprintedRoute(hopStopDirections));
      }
    };
  }
};
