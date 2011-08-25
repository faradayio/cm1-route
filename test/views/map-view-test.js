require('./helper');

vows.describe("MapView").addBatch({
  var map;

  beforeEach(function() {
    setFixtures('<div id="mapdiv">hi</div>');
    mapView = new MapView('#mapdiv');
  });

  '#canvas': {
    'returns the map div': function() {
      expect(mapView.canvas()).toBe('div#mapdiv');
    });
  });
});
