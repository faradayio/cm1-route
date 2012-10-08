var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    DirectBusDirections = require('./direct-bus-directions'),
    DirectRailDirections = require('./direct-rail-directions'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    WalkingSegment = require('../segment/walking-segment'),
    MapquestApi = require('../mapquest-api');

var async = require('async'),
    _ = require('underscore');

var MapquestDirections = function(origin, destination, mode, when) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode || 'PUBLICTRANSIT';
  this.when = when || 'now';
  this.geocoder = new google.maps.Geocoder();
  this.parameters = {};

  this.events = MapquestDirections.events;
}
MapquestDirections.prototype = new Directions();

MapquestDirections.AllWalkingSegmentsError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'AllWalkingSegmentsError';
  this.message = (message) ? message : 'All segments are walking segments';
};

MapquestDirections.events = new DirectionsEvents();

MapquestDirections.shouldDefaultTransitToDirectRoute = function(err) {
  err = err ? err : false;
  var walkingError = (err && err.name == 'AllWalkingSegmentsError'),
      mapquestError = (err && err.name == 'MapquestError');
  return ((walkingError || mapquestError) && process.env.TRANSIT_DIRECT_DEFAULT.toString() == 'true');
};

MapquestDirections.prototype.route = function(callback) {
  var directions = this;

  if(this.mode == 'SUBWAYING')
    callback = MapquestDirections.events.railFallbackCallback(callback);
  else if(this.mode == 'BUSSING')
    callback = MapquestDirections.events.busFallbackCallback(callback);

  async.parallel({
    origin: this.events.geocode(this, 'origin', 'originLatLng'),
    destination: this.events.geocode(this, 'destination', 'destinationLatLng')
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

MapquestDirections.prototype.calculateDistance = function() {
  this.distance = this.directionsResult.routes[0].legs[0].distance.value;
  this.distanceInMeters = this.distance * 1000;
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
        }),
        startPoint = chunk[0],
        endPoint = chunk[chunk.length - 1], 
        step = {
          duration: { value: maneuver.time },
          distance: { value: maneuver.distance * 1609.344 },  // mi => m
          instructions: maneuver.narrative,
          travel_mode: maneuver.transportMode,
          path: chunk
        };

    if(startPoint) {
      step.start_location = new google.maps.LatLng(startPoint.lat(), startPoint.lng());
      step.end_location = new google.maps.LatLng(endPoint.lat(), endPoint.lng());
    }

    return step;
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
      return callback(new MapquestApi.MapquestError('No viable transit route.'), directions);

    var directionsRoute = MapquestDirections.translateRoute(route);
    directions.storeRoute(directionsRoute);

    err = null;
    if(directions.isAllWalkingSegments()) {
      err = new MapquestDirections.AllWalkingSegmentsError('Invalid Mapquest route: all segments are walking segments');
    }
    callback(err, directions);
  };
};

MapquestDirections.events.railFallbackCallback = function(callback) {
  return function(err, hopStopDirections) {
    if(MapquestDirections.shouldDefaultTransitToDirectRoute(err)) {
      console.log('falling back to direct rail');
      var directDirections = new DirectRailDirections(
          hopStopDirections.origin, hopStopDirections.destination);
      directDirections.route(
        MapquestDirections.events.copyRoutedDirections(hopStopDirections, callback));
    } else {
      callback(err, hopStopDirections);
    }
  };
};

MapquestDirections.events.busFallbackCallback = function(callback) {
  return function(err, hopStopDirections) {
    if(MapquestDirections.shouldDefaultTransitToDirectRoute(err)) {
      console.log('falling back to google directions for bus');
      var drivingDirections = new DirectBusDirections(
          hopStopDirections.origin, hopStopDirections.destination);
      drivingDirections.route(
        MapquestDirections.events.copyRoutedDirections(hopStopDirections, callback));
    } else {
      callback(err, hopStopDirections);
    }
  };
};

MapquestDirections.events.copyRoutedDirections = function(originalDirections, callback) {
  return function(err, newDirections) {
    if(err) return callback(err, newDirections);

    originalDirections.storeRoute(newDirections.directionsResult);
    callback(null, originalDirections);
  };
};

module.exports = MapquestDirections;
