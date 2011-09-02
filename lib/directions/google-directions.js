var Directions = require('../directions');

var GoogleDirections = module.exports = function(origin, destination, mode) {
  this.origin = origin
  this.destination = destination
  this.mode = mode
}
GoogleDirections.prototype = new Directions

GoogleDirections.prototype.directionsService = function() {
  if(!this._directionsService) {
    this._directionsService = new google.maps.DirectionsService()
  }

  return this._directionsService
};

GoogleDirections.prototype.route = function(callback) {
  var request = {
    origin: this.origin, 
    destination: this.destination,
    travelMode: this.mode
  };
  this.directionsService().
    route(request,
          GoogleDirections.events.directionsServiceRouteCallback(this, callback));
};

GoogleDirections.prototype.calculateDistance = function() {
  this.distance = this.directionsResult.routes[0].legs[0].distance.value;
};

// Events

GoogleDirections.events = {
  directionsServiceRouteCallback: function(directions, callback) {
    return function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directions.storeRoute(result);
        callback(null, directions)
      } else {
        var err = new Error('Failed to get route from google: ' + status);
        callback(err);
      }
    };
  }
};
