require('./helper');

vows.describe('Directions').addBatch({
  var directions

  beforeEach(function() {
    directions = Directions.create('Lansing, MI', 'Ann Arbor, MI', 'DRIVING')
    directions.directionsResult = GoogleResult.driving
    fakeAjax({
      urls: {
        'http://carbon.brighterplanet.com/automobile_trips.json?distance=0.688': {
          successData: {emission: 6.8}},
        'http://carbon.brighterplanet.com/automobile_trips.json?distance=0.128': {
          successData: {emission: 1.2}},
        'http://carbon.brighterplanet.com/automobile_trips.json?distance=0.045': {
          successData: {emission: 0.4}},
        'http://carbon.brighterplanet.com/automobile_trips.json?distance=9.025': {
          successData: {emission: 90.2}}
      }
    });
  })

  '.create': {
    'creates HopStopDirections': function() {
      var dir = Directions.create('A','B','PUBLICTRANSIT', 'today')
      expect(dir).toBeInstanceOf(HopStopDirections)
    })
    'creates GoogleDirections for Driving': function() {
      var dir = Directions.create('A','B','DRIVING')
      expect(dir).toBeInstanceOf(GoogleDirections)
    })
    'creates GoogleDirections for Walking': function() {
      var dir = Directions.create('A','B','WALKING')
      expect(dir).toBeInstanceOf(GoogleDirections)
    })
    'creates GoogleDirections for Bicycling': function() {
      var dir = Directions.create('A','B','BICYCLING')
      expect(dir).toBeInstanceOf(GoogleDirections)
    })
  })

  '#segments': {
    'returns an array of segments': function() {
      var segments = directions.segments()

      expect(segments[0].distance).toEqual(0.688)
      expect(segments[0].index).toEqual(0)

      expect(segments[1].distance).toEqual(0.128)
      expect(segments[1].index).toEqual(1)

      expect(segments[2].distance).toEqual(0.045)
      expect(segments[2].index).toEqual(2)

      expect(segments[3].distance).toEqual(9.025)
      expect(segments[3].index).toEqual(3)
    })
  })

  '#getEmissions': {
    'gets emissions for all segments': function() {
      directions.eachSegment(function(segment) {
        segment.getEmissionEstimateWithSegment = jasmine.createSpy();
      });
      directions.getEmissions(function() {}, function() {})
      directions.eachSegment(function(segment) {
        expect(segment.getEmissionEstimateWithSegment).toHaveBeenCalled();
      });
    });
    'fires the onFinish event when all segments have calculated emissions': function() {
      var onFinish = jasmine.createSpy('onFinish');

      directions.getEmissions(function() {}, function() {}, onFinish);

      expect(onFinish).toHaveBeenCalledWith(directions);
    });
  });

  '#onSegmentEmissionsSuccess': {
    'updates the total emissions': function() {
      directions.getEmissions(function() {}, function() {});
      expect(directions.totalEmissions).toBeClose(98.6, 0.01);
    });
    'fires the onFinish event when all segments have calculated emissions': function() {
      var onFinish = jasmine.createSpy('onFinish');

      var onner = directions.onSegmentEmissionsSuccess(function() {}, onFinish);
      onner(0, { value: function() { return 1; } });
      onner(1, { value: function() { return 1; } });
      onner(2, { value: function() { return 1; } });
      onner(3, { value: function() { return 1; } });

      expect(onFinish).toHaveBeenCalledWith(directions);
    });
  });

  '#totalTime': {
    "sums each segment's duration and pretty prints the result": function() {
      expect(directions.totalTime()).toBe('6 mins');
    });
    'returns empty string if there are no segments': function() {
      directions._segments = [];
      expect(directions.totalTime()).toBe('');
    });
  });
});
