describe('LightRailingSegment', function() {
  it('converts distance to kilometers', function() {
    var ws = new LightRailingSegment(0, { distance: { value: 3401 } });
    expect(ws.distance).toBeClose(3.401, 0.0001)
  });
  it('provides duration in seconds', function() {
    var ws = new LightRailingSegment(0, { duration: { value: 120 } });
    expect(ws.duration).toBe(120);
  });
});
