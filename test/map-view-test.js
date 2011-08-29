require('./helper');
var MapView = require('../lib/map-view');

vows.describe("MapView").addBatch({
  '#canvas': {
    'returns the map div': function() {
      setHtmlFixtures('<div id="mapdiv">hi</div>');
      mapView = new MapView('mapdiv');
      assert.equal(mapView.canvas.id, 'mapdiv');
    }
  }
}).export(module);
