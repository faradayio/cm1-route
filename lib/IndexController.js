function IndexController(mapId) {
  this.mapView = new MapView(mapId);
  this.directionsDisplay = new google.maps.DirectionsRenderer();
  this.directions = {};
  this.routeViews = {};
  var modes = IndexController.modes;
  for(var i in modes) { this.routeViews[modes[i].toLowerCase()] = new RouteView(this, modes[i]); }
  this.hootBarController = new HootBarController(this);

  return true;
}

IndexController.modes = ['DRIVING','WALKING','BICYCLING','PUBLICTRANSIT','FLYING'];

IndexController.prototype.init = function() {
  Carbon.key = 'fd881ce1f975ac07b5c396591bd6978a'
  this.mapView.resize();
  this.mapView.googleMap();
};

IndexController.prototype.getEmissions = function(directions) {
  directions.getEmissions(
      this.onSegmentEmissionsSuccess(this),
      this.onSegmentEmissionsFailure(this),
      this.onSegmentEmissionsFinish);
};

IndexController.prototype.getDirections = function () {
  for(var i in IndexController.modes) {
    var mode = IndexController.modes[i].toLowerCase();
    var direction = Directions.create(
      $('#origin').val(), $('#destination').val(), IndexController.modes[i]);
    this.directions[mode] = direction;
    direction.route(
      this.onDirectionsRouteSuccess(this),
      this.onDirectionsRouteFailure(this));
  }
  this.directionsDisplay.setMap(null); 
  this.directionsDisplay.setMap(this.mapView.googleMap());
}

IndexController.prototype.displayDirectionsFor = function(directions) {
  if(directions.mode == 'FLYING') { 
    this.flightPath().display();
  } else {
    this.directionsDisplay.setOptions({ preserveViewport: true });
    this.directionsDisplay.setDirections(directions.directionsResult);
    this.directionsDisplay.setMap(this.mapView.googleMap());
  }
};

IndexController.prototype.hideDirectionsFor = function(directions) {
  if(directions.mode == 'FLYING') { 
    this.flightPath().hide();
  } else {
    this.directionsDisplay.setMap(null);
  }
};

IndexController.prototype.flightPath = function() {
  if(!this._flightPath && this.directions.flying) {
    this._flightPath = new FlightPath(this, this.directions.flying); 
  }
  return this._flightPath;
};

IndexController.prototype.clearFlightPath = function() {
  this._flightPath = null;
};

//////  Events 

IndexController.prototype.onDirectionsRouteSuccess = function(controller) {
  return function(directions) {
    controller.getEmissions(directions);
    if(directions.mode == 'DRIVING') {
      controller.directionsDisplay.setOptions({ preserveViewport: false });
      controller.directionsDisplay.setDirections(directions.directionsResult);
    }
    $('#' + directions.mode.toLowerCase() + ' a span.total_time').html(directions.totalTime());
  };
}
