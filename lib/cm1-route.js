var FlyingDirections = require('./directions/flying-directions'),
    FootprintedRoute = require('./footprinted-route'),
    GoogleDirections = require('./directions/google-directions'),
    HopStopDirections = require('./directions/hop-stop-directions');

var Cm1Route = module.exports = {
  MapView: require('./map-view'),
  NumberFormatter: require('./number-formatter'),
  FlyingDirections: FlyingDirections,
  GoogleDirections: GoogleDirections,
  HopStopDirections: HopStopDirections,

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
    directions.routeWithEmissions(events.translateRouteCallback(callback));
  }
};

var events = {
  translateRouteCallback: function(callback) {
    return function(err, directions) {
      callback(err, new FootprintedRoute(directions));
    };
  }
};
