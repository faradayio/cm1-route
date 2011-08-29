require('./helper');
var TimeFormatter = require('../lib/time-formatter');

vows.describe('TimeFormatter').addBatch({
  '.format': {
    'returns empty string for 0 seconds': function() {
      assert.deepEqual(TimeFormatter.format(0), '');
    },
    'converts 1 second': function() {
      assert.deepEqual(TimeFormatter.format(1), '1 min');
    },
    'converts 59 seconds': function() {
      assert.deepEqual(TimeFormatter.format(59), '1 min');
    },
    'converts 60 seconds': function() {
      assert.deepEqual(TimeFormatter.format(60), '1 min');
    },
    'converts 90 seconds': function() {
      assert.deepEqual(TimeFormatter.format(90), '2 mins');
    },
    'converts 7200 seconds': function() {
      assert.deepEqual(TimeFormatter.format(7200), '2 hrs');
    },
    'converts 7201 seconds': function() {
      assert.deepEqual(TimeFormatter.format(7201), '2 hrs, 1 min');
    }
  },

  '.getParts': {
    'gets parts for 0 seconds': function() {
      assert.deepEqual(TimeFormatter.getParts(0), { minutes: 0 });
    },
    'gets parts for 1 second': function() {
      assert.deepEqual(TimeFormatter.getParts(1), { minutes: 1 });
    },
    'gets parts for 59 seconds': function() {
      assert.deepEqual(TimeFormatter.getParts(59), { minutes: 1 });
    },
    'gets parts for 60 seconds': function() {
      assert.deepEqual(TimeFormatter.getParts(60), { minutes: 1 });
    },
    'gets parts for 90 seconds': function() {
      assert.deepEqual(TimeFormatter.getParts(90), { minutes: 2 });
    },
    'gets parts for 7200 seconds': function() {
      assert.deepEqual(TimeFormatter.getParts(7200), { hours: 2 });
    },
    'gets parts for 7201 seconds': function() {
      assert.deepEqual(TimeFormatter.getParts(7201), { hours: 2, minutes: 1 });
    }
  }
}).export(module);
