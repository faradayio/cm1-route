var http = require('http');

var HootrootApi = {};

HootrootApi.HopStopError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'HopStopError';
  this.message = message;
};

HootrootApi.hopstop = function(params, callback) {
  var query  = '?x1=' + params.x1;
      query += '&y1=' + params.y1;
      query += '&x2=' + params.x2;
      query += '&y2=' + params.y2;
      query += '&mode=' + params.mode;
      query += '&when=' + params.when;
  var request = http.request({
    host: 'cm1-route.brighterplanet.com', port: 80, path: '/hopstops' + query,
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  }, function (response) {
    if(response.statusCode >= 300) {
      callback(new HootrootApi.HopStopError('Hopstop routing failed: ' + response.statusCode));
    } else {
      var data = '';
      response.on('data', function (buf) {
        data += buf;
      });
      response.on('error', function() {
        callback(new HootrootApi.HopStopError('Hopstop routing failed: ' + data));
      });

      response.on('end', function () {
        var json = JSON.parse(data);
        callback(null, json);
      });
    }
  });
  request.end();
};

module.exports = HootrootApi;
