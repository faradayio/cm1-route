require('./helper');

vows.describe('DrivingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ds = new DrivingSegment(0, { distance: { value: 3401 } });
    expect(ds.distance).toBeClose(3.401, 0.0001)
  });
  'provides duration': function() {
    var ds = new DrivingSegment(0, { duration: { value: 3401 } });
    expect(ds.duration).toBe(3401);
  });

  '#getEmissionEstimateWithSegment': {
    var emissions, segment;
    beforeEach(function() {
      fakeAjax({
        urls: { 'http://carbon.brighterplanet.com/automobile_trips.json?distance=0.0285':
          { successData: {emission: 6.8} } } });
      var driving = new DrivingSegment(0, {
        distance: { value: 28.5 },
        instructions: 'Go here' });
      driving.getEmissionEstimateWithSegment(function(f_segment, emissionEstimate) {
        segment = f_segment;
        emissions = emissionEstimate.value();
      });
    });

    'passes a segment parameter': function() {
      expect(segment.index).toBe(0);
    });
    'passes an emissions parameter': function() {
      expect(emissions).toBe(6.8);
    });
  });
});
