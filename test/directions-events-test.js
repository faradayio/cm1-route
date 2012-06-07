var helper = require('./helper'),
    assert = helper.assert,
    vows = helper.vows;

var DirectionsEvents = helper.lib.require('../lib/directions-events');

var events = new DirectionsEvents();
var goodDirections = {
  origin: 'Lansing, MI',
  geocoder: {
    geocode: function(params, callback) {
      callback([{geometry: { location: new google.maps.LatLng(1,1) } }]);
    }
  }
};
var badDirections = {
  origin: 'Dansing, MI',
  geocoder: {
    geocode: function(params, callback) {
      callback([]);
    }
  }
};
var geocodedDirections = {
  origin: new google.maps.LatLng(1,1),
  geocoder: {
    geocode: function(params, callback) {
      callback([]);
    }
  }
};

vows.describe('DirectionsEvents').addBatch({
  '#geocode': {
    'on success': {
      topic: function() {
        var evt = events.geocode(goodDirections, 'origin', 'originLatLng');
        evt(this.callback);
      },
  
      'returns a null error': function(err) {
        assert.isNull(err);
      },
      'sets the xLatLng property': function() {
        assert.isFunction(goodDirections.originLatLng.lat);
      }
    },

    'on failure': {
      topic: function() {
        var evt = events.geocode(badDirections, 'origin', 'originLatLng');
        evt(this.callback);
      },
      
      'returns an error in the callback': function(err) {
        assert.instanceOf(err, DirectionsEvents.GeocodeError);
      }
    },
    
    'with an already geocoded address': {
      topic: function() {
        var evt = events.geocode(geocodedDirections, 'origin', 'originLatLng');
        evt(this.callback);
      },
      'sets the xLatLng property': function(err, result) {
        assert.equal(geocodedDirections.originLatLng, geocodedDirections.origin);
      }
    }
  },

  '#onSegmentGetEmissionEstimate': {
    topic: { totalEmissions: 0 },

    'on success': {
      'with segment callback': {
        topic: function(directions) {
          var onSegmentGetEmissionEstimate = events.
            onSegmentGetEmissionEstimate(directions, this.callback, function() {});
          onSegmentGetEmissionEstimate(null, { carbon: 1 });
        },

        'sends the impacts to the segment callback': function(err, impacts) {
          assert.equal(impacts.carbon, 1);
        }
      },
      'without segment callback': {
        topic: function(directions) {
          var onSegmentGetEmissionEstimate = events.
            onSegmentGetEmissionEstimate(directions, null, this.callback);
          onSegmentGetEmissionEstimate(null, { carbon: 2 });
        },

        'increments totalEmissions': function(err, impacts) {
          assert.isNull(err);
        }
      }
    },

    'on error': {
      topic: function(directions) {
        var onSegmentGetEmissionEstimate = events.
            onSegmentGetEmissionEstimate(directions, null, this.callback);
        onSegmentGetEmissionEstimate('failed', {});
      },

      'aborts async operation': function(err) {
        assert.equal(err, 'failed');
      }
    }
  }
}).export(module, { error: false });
