require('../helper');

var GoogleDirections = require('../../lib/directions/google-directions');

var directions = new GoogleDirections('A','B','WALKING');

vows.describe('GoogleDirections').addBatch({
  'has a directionsService property': function() {
    assert.isNotNull(directions.directionsService);
  },

  '#steps': {
    'returns an array of steps': function() {
      directions.directionsResult = GoogleResult.driving
      var steps = directions.steps()

      assert.equal(steps[0].distance.value, 688)
      assert.equal(steps[1].distance.value, 128)
      assert.equal(steps[2].distance.value, 45)
      assert.equal(steps[3].distance.value, 9025)
    }
  }
}).export(module);
