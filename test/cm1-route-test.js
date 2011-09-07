require('./helper');
var HopStopResult = require('./fixtures/hop-stop-result');

var Cm1Route = require('../lib/cm1-route');

var fakeweb = require('fakeweb'),
    http = require('http');

var providesRoutingCallback = function(mode, args, extraVows) {
  extraVows = extraVows || {};

  extraVows['callback'] = {
    'on success': {
      topic: function() {
        args.push(this.callback);
        Cm1Route[mode].apply(Cm1Route, args)
      },

      'returns null for err': function(err) {
        assert.isNull(err);
      },
      'provides .distance': function(err, data) {
        assert.isNumber(data.distance);
      },
      'provides .route': function(err, data) {
        assert.instanceOf(data.directions, google.maps.Directions);
      },
      'provides .emissions': function(err, data) {
        assert.isNumber(data.emissions.tons);
        assert.isNumber(data.emissions.pounds);
        assert.isNumber(data.emissions.kilograms);
      }
    },
    'on error': {
      topic: function() {
        sinon.stub(google.maps, 'DirectionsService', function() {
          this.route = function(result, callback) {
            callback({}, 'BADNEWSBEARS');
          };
        });

        args.push(this.callback);
        Cm1Route[mode].apply(Cm1Route, args);
        google.maps.DirectionsService.restore();
      },

      'callback responds with error if routing fails': function(err) {
        assert.instanceOf(err, Error);
      },
    }
  };

  return extraVows;
};

vows.describe('Cm1Route').addBatch({
  '#drive': providesRoutingCallback('drive', ['Lansing, MI', 'Chicago, IL']),
  '#flight': providesRoutingCallback('flight', ['Lansing, MI', 'Chicago, IL']),
  '#transit': providesRoutingCallback('transit', ['Lansing, MI', 'Chicago, IL', 'Mon 12am'], {
    'defaults to straight line distance if no route is found': function() {
      http.register_intercept({
        uri: '/hopstops?x1=1&x2=1&y1=1&y1=1&mode=PUBLICTRANSIT&when=Mon 12am', 
        host: 'hootroot.com',
        body: JSON.stringify(HopStopResult.subway)
      });

      Cm1Route.transit('Lansing, MI', 'Chicago, IL', 'Mon 12am', function(err, data) {
        assert.equal(data.directions.length, 1);
      });
    }
  })
}).export(module, { error: false });
