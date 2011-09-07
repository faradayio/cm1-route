var http = require('http');

var HootrootApi = module.exports = {
  hopstop: function(params, callback) {
    var query  = '?x1=' + params.x1;
        query += '&x2=' + params.x2;
        query += '&y1=' + params.y1;
        query += '&y1=' + params.y1;
        query += '&mode=' + params.mode;
        query += '&when=' + params.when;
    var request = http.request({
      host: 'hootroot.com', port: 80, path: '/hopstops' + query,
      method: 'GET',
      headers: { ContentType: 'application/json' }
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

    //var $ = require('jquery');

    //$.ajax({
      //url: '/hopstops',
      //data: request,
      //success: function(data) {
        //callback(null, data);
      //},
      //error: callback
    //});
  }
};
