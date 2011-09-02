require('../helper');
var GoogleResult = require('../fixtures/google-result'),
    directionsBehavior = require('../directions-behavior');

var GoogleDirections = require('../../lib/directions/google-directions');

var directions = new GoogleDirections('A','B','WALKING');

var goodDirections = new GoogleDirections('A','B','WALKING');
sinon.stub(goodDirections,'directionsService').returns({ 
  route: function(request, callback) {
    callback(GoogleResult.walking, google.maps.DirectionsStatus.OK);
  }
});
var badDirections = new GoogleDirections('A','B','WALKING');
sinon.stub(badDirections,'directionsService').returns({
  route: function(request, callback) {
    callback({}, 'BADNEWSBEARS');
  }
});

vows.describe('GoogleDirections').addBatch({
  'has a directionsService property': function() {
    assert.isNotNull(directions.directionsService);
  },

  '#route': directionsBehavior.providesRoute(goodDirections, badDirections),
  '#storeRoute': directionsBehavior.proviesStoreRoute(goodDirections),
  '#calculateDistance': directionsBehavior.proviesCalculateDistance(goodDirections),

  '#distanceEstimate': {
    'returns a total distance': function() {
      // TODO
    }
  }
}).export(module, { error: false });
