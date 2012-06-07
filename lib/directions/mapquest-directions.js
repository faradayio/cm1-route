var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    WalkingSegment = require('../segment/walking-segment'),
    MapquestApi = require('../mapquest-api');

var async = require('async'),
    _ = require('underscore');

var MapquestDirections = module.exports = function(origin, destination, mode, when) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode || 'PUBLICTRANSIT';
  this.when = when || 'now';
  this.geocoder = new google.maps.Geocoder();
  this.parameters = {};
}
MapquestDirections.prototype = new Directions();

MapquestDirections.events = new DirectionsEvents();

MapquestDirections.prototype.route = function(callback) {
  var directions = this;

  async.parallel({
    origin: MapquestDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: MapquestDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, function(err, geocodes) {
    if(err) callback(err, directions);

    directions.fetchMapquest(callback);
  });
};

MapquestDirections.prototype.originLatLngString = function() {
  return this.originLatLng.lat() + ',' + this.originLatLng.lng();
};
MapquestDirections.prototype.destinationLatLngString = function() {
  return this.destinationLatLng.lat() + ',' + this.destinationLatLng.lng();
};

MapquestDirections.prototype.fetchMapquest = function(callback) {
  MapquestApi.fetch(this.originLatLngString(), this.destinationLatLngString(),
    MapquestDirections.events.processMapquest(this, callback));
};

MapquestDirections.translateRoute = function(result) {
  var route = {
    copyrights: result.info.copyright.text,
    overview_path: MapquestDirections.generateOverviewPath(result.route.shape.shapePoints)
  };
  route.legs = [{
    duration: { value: result.route.time },
    distance: { value: result.route.distance * 1.609344 }, // mi => km
    start_address: '',
    start_location: _.first(route.overview_path),
    end_address: '',
    end_location: _.last(route.overview_path),
    steps: MapquestDirections.generateGoogleSteps(
        result.route.legs[0].maneuvers,
        result.route.shape.maneuverIndexes,
        route.overview_path),
    via_waypoints: []
  }];
  route.warnings = [];
  route.bounds = MapquestDirections.generateBounds(result.route.boundingBox);

  this.distance = route.legs[0].distance.value;
  this.distanceInMeters = this.distance * 1000;

  return {
    Ib: {
      travelMode: 'DRIVING'
    },
    routes: [route],
    status: 'OK'
  };
};

MapquestDirections.generateOverviewPath = function(decimals) {
  var path = [];
  var lat;
  _.each(decimals, function(decimal, i) {
    if(i % 2 == 0) {
      lat = decimal;
    } else {
      path.push(new google.maps.LatLng(lat, decimal));
    }
  });

  return path;
};

MapquestDirections.generateGoogleSteps = function(maneuvers, pathIndexes, overviewPath) {
  return _.map(maneuvers, function(maneuver, i) {
    var startIndex = pathIndexes[i] / 2,
        stopIndex = (pathIndexes[i + 1] - 2) / 2,
        chunk = _.filter(overviewPath, function(latLng, i) {
          return startIndex <= i && i <= (stopIndex || overviewPath.length);
        });

    return {
      duration: { value: maneuver.time },
      distance: { value: maneuver.distance * 1609.344 },  // mi => m
      instructions: maneuver.narrative,
      travel_mode: maneuver.transportMode,
      path: chunk
    };
  });
};

MapquestDirections.generateBounds = function(boundingBox) {
  var southWest = new google.maps.LatLng(boundingBox.lr.lat, boundingBox.ul.lng),
      northEast = new google.maps.LatLng(boundingBox.ul.lat, boundingBox.lr.lng);

  return new google.maps.LatLngBounds(southWest, northEast);
};


// Events

MapquestDirections.events.processMapquest = function(directions, callback) {
  return function(err, route) {
    if(err) return callback(err, directions);
    if(route.info.statuscode >= 400)
      return callback(new Error('No viable transit route.'), directions);

    var directionsRoute = MapquestDirections.translateRoute(route);
    directions.storeRoute(directionsRoute);

    err = null;
    if(directions.isAllWalkingSegments()) {
      err = new MapquestDirections.AllWalkingSegmentsError('Invalid Mapquest route: all segments are walking segments');
    }
    callback(err, directions);
  };
};
