require('./helper');

var Cm1Route = require('../lib/cm1-route');

var providesRoutingCallback = function(mode, extraVows) {
  extraVows = extraVows || {};

  extraVows['callback'] = {
    'on success': {
      topic: function() {
        Cm1Route[mode]('Lansing, MI', 'Chicago, IL', this.callback, sinon.stub())
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
        Cm1Route[mode]('Lansing, MI', 'Chicago, IL', sinon.stub(), this.callback)
      },

      'callback responds with error if routing fails': function(err) {
        assert.instanceOf(err, Error);
      },
    }
  };

  return extraVows;
};

vows.describe('Cm1Route').addBatch({
  '#driving': providesRoutingCallback('driving'),
  '#flight': providesRoutingCallback('flight'),
  '#transit': providesRoutingCallback('transit', {
    'defaults to straight line distance if no route is found': function() {
      Cm1Route.transit('Lansing, MI', 'Chicago, IL', function(err, data) {
        assert.equal(data.directions.length, 1);
      });
    }
  }),
  '#walking': providesRoutingCallback('walking'),
  '#bicycling': providesRoutingCallback('bicycling')
}).export(module);
