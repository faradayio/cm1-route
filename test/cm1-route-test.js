require('./helper');

var Cm1Route = require('../lib/cm1-route');

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
  '#drive': providesRoutingCallback('drive', ['Lansing, MI', 'Chicago, IL']),
  '#flight': providesRoutingCallback('flight', ['Lansing, MI', 'Chicago, IL']),
  '#transit': providesRoutingCallback('transit', ['Lansing, MI', 'Chicago, IL', 'Mon 12am'], {
    'defaults to straight line distance if no route is found': function() {
      Cm1Route.transit('Lansing, MI', 'Chicago, IL', function(err, data) {
        assert.equal(data.directions.length, 1);
      });
    }
  })
}).export(module);
