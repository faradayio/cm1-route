var http = require('http'),
    JSON = require('JSON'),
    querystring = require('querystring');

var MapquestApi = {
  fetch: function(from, to, callback) {
    var query = querystring.stringify({
      from: from, to: to
    });
    var request = http.request({
      path: '/mapquest?' + query,
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
