var Directions = require('../directions'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    WalkingSegment = require('../segment/walking-segment');
var googleMaps = require('googlemaps'),
    http = require('http'),
    queryString = require('querystring');

var HopStopDirections = module.exports = function(origin, destination, mode, when) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode;
  this.when = when;
}
HopStopDirections.prototype = new Directions;

HopStopDirections.prototype.route = function(onSuccess, onError) {
  googleMaps.geocode({address: this.origin},
    HopStopDirections.events.onGeocodeOriginSuccess(this, onSuccess, onError));
  googleMaps.geocode({address: this.destination},
    HopStopDirections.events.onGeocodeDestinationSuccess(this, onSuccess, onError));
};

HopStopDirections.prototype.isFullyGeocoded = function() {
  return this.x1 != null && this.y1 != null && this.x2 != null && this.y2 != null;
};

HopStopDirections.prototype.isAllWalkingSegments = function() {
  var result = true;
  this.eachSegment(function(segment) {
    result = result && segment instanceof WalkingSegment;
  });
  return result;
};

HopStopDirections.events = {
  onGeocodeOriginSuccess: function(directions, onSuccess, onError) {
    return function(geocode) {
      this.x1 = geocode[0].geometry.location.lng();
      this.y1 = geocode[0].geometry.location.lat();
      HopStopDirections.events.onGeocodeSuccess(directions, onSuccess, onError);
    };
  },

  onGeocodeDestinationSuccess: function(directions, onSuccess, onError) {
    return function(geocode) {
      this.x2 = geocode[0].geometry.location.lng();
      this.y2 = geocode[0].geometry.location.lat();
      HopStopDirections.events.onGeocodeSuccess(directions, onSuccess, onError);
    };
  },

  onGeocodeSuccess: function(directions, onSuccess, onError) {
    if(directions.isFullyGeocoded()) {
      var request = {
        x1: directions.x1, 
        y1: directions.y1, 
        x2: directions.x2, 
        y2: directions.y2, 
        mode: directions.mode,
        when: directions.when
      };
      var path = '/hopstops' + queryString.stringify(request);
      
      var callback = HopStopDirections.events.onHopStopSuccess(directions, onSuccess, onError);
      var req = http.request({
        host: 'hootroot.com', port: 80, path: path,
        headers: { ContentType: 'application/json' }
      }, function (res) {
        var data = '';
        res.on('data', function (buf) {
          data += buf;
        });

        res.on('error', onError);

        res.on('end', function () {
          var json = JSON.parse(data);
          callback(json);
        });
      });
      req.end();
    }
  },

  onHopStopSuccess: function(directions, onSuccess, onError) {
    return function(data) {
      directions.directionsResult = { routes: [new GoogleDirectionsRoute(data)] };
      if(directions.isAllWalkingSegments()) {
        onError(directions, data);
      } else {
        onSuccess(directions);
      }
    }
  }
}
