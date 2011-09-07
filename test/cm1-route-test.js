require('./helper');
var Cm1Result = require('./fixtures/cm1-result'),
    HopStopResult = require('./fixtures/hop-stop-result'),
    HopStopDirections = require('../lib/directions/hop-stop-directions');

var Cm1Route = require('../lib/cm1-route');

var fakeweb = require('fakeweb'),
    http = require('http');

http.register_intercept({
  uri: /hopstops/,
  host: 'hootroot.com',
  body: JSON.stringify(HopStopResult.subway)
});

http.register_intercept({
  uri: /.*/,
  host: 'carbon.brighterplanet.com',
  body: JSON.stringify(Cm1Result.fit)
});

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
    'on error': sinon.testCase({
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

      'callback responds with error if geocoding fails': function(err) {
        assert.instanceOf(err, Error);

        google.maps.DirectionsService.restore();
      },
    })
  };

  return extraVows;
};

vows.describe('Cm1Route').addBatch({
  '#drive': providesRoutingCallback('drive', ['Lansing, MI', 'Chicago, IL']),
  '#flight': providesRoutingCallback('flight', ['Lansing, MI', 'Chicago, IL']),
  '#transit': providesRoutingCallback('transit', ['Lansing, MI', 'Chicago, IL', 'Mon 12am'], sinon.testCase({
    'defaults to straight line distance if no route is found': function() {
      sinon.stub(Cm1Route, 'shouldDefaultTransitToDirectRoute').returns(true);

      Cm1Route.transit('Lansing, MI', 'Chicago, IL', 'Mon 12am', function(err, data) {
        assert.equal(data.directions.length, 1);
      });

      Cm1Route.shouldDefaultTransitToDirectRoute.restore();
    }
  })),

  '#shouldDefaultTransitToDirectRoute': {
    'returns true for an AllWalkingSegmentsError and TRANSIT_DIRECT_DEFAULT env is true': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = true;
      var err = new HopStopDirections.AllWalkingSegmentsError('FAIL');
      assert.isTrue(Cm1Route.shouldDefaultTransitToDirectRoute(err));
    },
    'returns false for null err': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = true;
      assert.isFalse(Cm1Route.shouldDefaultTransitToDirectRoute(null));
    },
    'returns false for non-AllWalkingSegmentsError': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = true;
      var err = new Error('LULZ');
      assert.isFalse(Cm1Route.shouldDefaultTransitToDirectRoute(null));
    },
    'returns false if TRANSIT_DIRECT_DEFAULT env is false': function() {
      process.env.TRANSIT_DIRECT_DEFAULT = false;
      var err = new HopStopDirections.AllWalkingSegmentsError('FAIL');
      assert.isFalse(Cm1Route.shouldDefaultTransitToDirectRoute(err));
    }
  }
}).export(module, { error: false });
