var vows = require('vows'),
  assert = require('assert');

vows.describe('NativeRoute').addBatch({
  topic: new(NativeRoute('Lansing, MI', 'Chicago, IL')),

  '#routeAutomobile': function(route) {
    assert.include(route.automobile(), 'totalDistance');
    assert.include(route.automobile(), 'segments');
  },
  '#routeBus': function(route) {
    assert.include(route.bus(), 'totalDistance');
    assert.include(route.bus(), 'segments');
  },
  '#routeFlight': function(route) {
    assert.include(route.flight(), 'totalDistance');
    assert.include(route.flight(), 'segments');
  },
  '#routeRail': function(route) {
    assert.include(route.rail(), 'totalDistance');
    assert.include(route.rail(), 'segments');
  }
}).export(module);
