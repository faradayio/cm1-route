var $ = require('jquery-browserify'),
    JSON = require('JSON'),
    querystring = require('querystring');

var MapquestApi = {
  fetch: function(from, to, callback) {
    var query = querystring.stringify({
      from: from, to: to, ambiguities: 'ignore', avoidTimedConditions: 'true',
      doReverseGeocode: 'false', routeType: 'multimodal', timeType: '1',
      enhancedNarrative: 'true', shapeFormat: 'raw', generalize: '0', unit: 'm',
      key: process.env.MAPQUEST_KEY
    });
    $.ajax({
      url: 'http://www.mapquestapi.com/directions/v1/route?' + query,
      dataType: 'jsonp',
      error: function(xhr, err) {
        callback(new MapquestApi.MapquestError(err));
      },
      success: function(data) {
        callback(null, data);
      }
    })
  }
};

MapquestApi.MapquestError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'MapquestError';
  this.message = message;
};

module.exports = MapquestApi;
