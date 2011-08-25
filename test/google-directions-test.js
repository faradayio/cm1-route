require('./helper');

vows.describe('GoogleDirections').addBatch({
  var directions

  beforeEach(function() {
    directions = new GoogleDirections('A','B','WALKING')
  })

  'has a directionsService property': function() {
    expect(directions.directionsService).toBeDefined()
  })

  '#steps': {
    'returns an array of steps': function() {
      directions.directionsResult = GoogleResult.driving
      var steps = directions.steps()

      expect(steps[0].distance.value).toEqual(688)
      expect(steps[1].distance.value).toEqual(128)
      expect(steps[2].distance.value).toEqual(45)
      expect(steps[3].distance.value).toEqual(9025)
    })
  })
})
