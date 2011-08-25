require('./helper');

vows.describe('Segment').addBatch({
  '.create': {
    'reutrns a DrivingSegment object': function() {
      var step = { distance: 1, travel_mode: 'DRIVING' }
      var segment = Segment.create(0, step)
      expect(segment).toBeInstanceOf(DrivingSegment)
    })
    'returns a WalkingSegment object': function() {
      var step = { distance: 1, travel_mode: 'WALKING' }
      var segment = Segment.create(0, step)
      expect(segment).toBeInstanceOf(WalkingSegment)
    })
    'returns a BicyclingSegment object': function() {
      var step = { distance: 1, travel_mode: 'BICYCLING' }
      var segment = Segment.create(0, step)
      expect(segment).toBeInstanceOf(BicyclingSegment)
    })
    'returns a SubwayingSegment object': function() {
      var step = { distance: 1, travel_mode: 'SUBWAYING' }
      var segment = Segment.create(0, step)
      expect(segment).toBeInstanceOf(SubwayingSegment)
    })
    'returns a BussingSegment object': function() {
      var step = { distance: 1, travel_mode: 'BUSSING' }
      var segment = Segment.create(0, step)
      expect(segment).toBeInstanceOf(BussingSegment)
    })
    'throws an exception for an invalid travel mode': function() {
      var step = { distance: 1, travel_mode: 'HITCHHIKING' };
      expect(function() {
        Segment.create(0, step);
      }).toThrow();
    });
  });
});
