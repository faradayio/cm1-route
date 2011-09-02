var Directions = require('../lib/directions');

module.exports = {
  providesRoute: function(goodDirections, badDirections) {
    return {
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
          assert.instanceOf(err, Error);
          assert.match(err.message, /route/i);
        }
      }
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
