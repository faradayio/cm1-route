var http = require('http'),
    JSON = require('JSON'),
    querystring = require('querystring');

var MapquestApi = {
  fetch: function(from, to, callback) {
    var query = querystring.stringify({
      key: 'Fmjtd%7Cluu7n1u7ng%2C2g%3Do5-5rb0h',
      ambiguities: 'ignore', avoidTimedConditions: 'true',
      doReverseGeocode: 'false', routeType: 'multimodal',
      timeType: '1', enhancedNarrative: 'true',
      shapeFormat: 'raw', generalize: '0', unit: 'm',
      from: from, to: to
    });
    var request = http.request({
      host: 'www.mapquestapi.com', port: 80,
      path: '/directions/v1/route?' + query,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }, function (response) {
      if(response.statusCode >= 300) {
        callback(new Error('HTTP request for Hopstop failed: ' + response.statusCode));
      } else {
        var data = '';
        response.on('data', function (buf) {
          data += buf;
        });
        response.on('error', function() { callback('HTTP request for Hopstop failed: ' + data) });

        response.on('end', function () {
          var json = JSON.parse(data);
          callback(null, json);
        });
      }
    });
    request.end();
  }
};

module.exports = MapquestApi;
