require('./helper');

var NativeRoute = require('../lib/native-route');

vows.describe('NativeRoute').addBatch({
  'instance methods': {
    topic: new NativeRoute('Lansing, MI', 'Chicago, IL'),

    '#automobile': function(route) {
      assert.include(route.automobile(), 'totalDistance');
      assert.include(route.automobile(), 'segments');
    },
    '#bus': function(route) {
      assert.include(route.bus(), 'totalDistance');
      assert.include(route.bus(), 'segments');
    },
    '#flight': function(route) {
      assert.include(route.flight(), 'totalDistance');
      assert.include(route.flight(), 'segments');
    },
    '#rail': function(route) {
      assert.include(route.rail(), 'totalDistance');
      assert.include(route.rail(), 'segments');
    }
  }
}).export(module);
