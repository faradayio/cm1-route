var helper = require('./helper'),
    assert = helper.assert,
    lib = helper.lib;

var Directions = lib.require('./directions'),
    Segment = lib.require('./segment');

module.exports = {
  providesRoute: function(goodDirections, badDirections, extraVows) {
    var batch = {
      'on success': {
        topic: function() {
          goodDirections.route(this.callback);
        },

        'sends a null err to the callback': function(err, directions) {
          assert.isNull(err);
        },
        'sends the directions instance to the callback': function(err, directions) {
          assert.instanceOf(directions, Directions);
        },
        'sets #directionsResult': function(err, directions) {
          assert.isObject(directions.directionsResult);
        }
      },
      'on failure': {
        topic: function() {
          badDirections.route(this.callback);
        },

        'sends an Error object in err': function(err) {
          assert.isString(err.message);
        }
      },
    };
    if(extraVows) batch['and also'] = extraVows;
    return batch;
  },

  proviesStoreRoute: function(directions) {
    return {
      'sets #directionsResult': function() {
        assert.isObject(directions.directionsResult);
      },
      'sets #steps': function() {
        assert.isNotEmpty(directions.steps);
      },
      'sets #segments': function() {
        assert.isNotEmpty(directions.segments);
        directions.segments.forEach(function(segment) {
          assert.instanceOf(segment, Segment);
        });
      }
    };
  },

  proviesCalculateDistance: function(directions) {
    return {
      'sets #distance to a number value': function() {
        directions.calculateDistance();
        assert.isNumber(directions.distance);
      },
    };
  },

  geocodedOrigin: [{
    geometry: {
      location: {
        lat: function() { return 1; },
        lng: function() { return 1; }
      }
    }
  }],

  geocodedDestination: [{
    geometry: {
      location: {
        lat: function() { return 2; },
        lng: function() { return 2; }
      }
    }
  }]
};
