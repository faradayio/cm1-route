require('./helper');

vows.describe('CommuterRailingSegment').addBatch({
  'converts distance to kilometers': function() {
    var ws = new CommuterRailingSegment(0, { distance: { value: 3401 } });
    expect(ws.distance).toBeClose(3.401, 0.0001)
  });
  'provides duration in seconds': function() {
    var ws = new CommuterRailingSegment(0, { duration: { value: 120 } });
    expect(ws.duration).toBe(120);
  });
});
