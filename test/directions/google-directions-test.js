var helper = require('../helper'),
    lib = helper.lib
    vows = helper.vows,
    assert = helper.assert,
    sinon = helper.sinon;

var GoogleResult = require('../fixtures/google-result'),
    directionsBehavior = require('../directions-behavior');

var GoogleDirections = lib.require('./directions/google-directions');

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
}).export(module, { error: false });
