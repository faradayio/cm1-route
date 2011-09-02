var FlyingDirections = require('./directions/flying-directions'),
    GoogleDirections = require('./directions/google-directions'),
    HopStopDirections = require('./directions/hop-stop-directions');

var Cm1Route = module.exports = {
  MapView: require('./map-view'),
  NumberFormatter: require('./number-formatter'),

  // Get driving directions and associated emissions
  driving: function(origin, destination, callback) {
    var directions = new GoogleDirections(origin, destination, 'DRIVING');
    directions.routeWithEmissions(callback);
  },

  // Get flying directions and associated emissions
  flight: function(origin, destination, callback) {
    var directions = new FlyingDirections(origin, destination);
    directions.routeWithEmissions(callback);
  },

  // Get transit (bus, rail) directions and associated emissions
  transit: function(origin, destination, day, time, callback) {
    var directions = new HopStopDirections(origin, destination, 'PUBLICTRANSIT', when);
    callback(err, {
      totalDistance: 100,
      directions: []
    });
  }
};

var events = {
  translateRouteCallback: function(callback) {
    return function(err, directions) {
      callback(err, new 
    };
  }
};
