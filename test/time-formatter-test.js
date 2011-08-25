require('./helper');

vows.describe('TimeFormatter').addBatch({
  '.format': {
    'returns empty string for 0 seconds': function() {
      expect(TimeFormatter.format(0)).toBe('');
    });
    'converts 1 second': function() {
      expect(TimeFormatter.format(1)).toBe('1 min');
    });
    'converts 59 seconds': function() {
      expect(TimeFormatter.format(59)).toBe('1 min');
    });
    'converts 60 seconds': function() {
      expect(TimeFormatter.format(60)).toBe('1 min');
    });
    'converts 90 seconds': function() {
      expect(TimeFormatter.format(90)).toBe('2 mins');
    });
    'converts 7200 seconds': function() {
      expect(TimeFormatter.format(7200)).toBe('2 hrs');
    });
    'converts 7201 seconds': function() {
      expect(TimeFormatter.format(7201)).toBe('2 hrs, 1 min');
    });
  });

  '.getParts': {
    'gets parts for 0 seconds': function() {
      expect(TimeFormatter.getParts(0)).toEqual({ minutes: 0 });
    });
    'gets parts for 1 second': function() {
      expect(TimeFormatter.getParts(1)).toEqual({ minutes: 1 });
    });
    'gets parts for 59 seconds': function() {
      expect(TimeFormatter.getParts(59)).toEqual({ minutes: 1 });
    });
    'gets parts for 60 seconds': function() {
      expect(TimeFormatter.getParts(60)).toEqual({ minutes: 1 });
    });
    'gets parts for 90 seconds': function() {
      expect(TimeFormatter.getParts(90)).toEqual({ minutes: 2 });
    });
    'gets parts for 7200 seconds': function() {
      expect(TimeFormatter.getParts(7200)).toEqual({ hours: 2 });
    });
    'gets parts for 7201 seconds': function() {
      expect(TimeFormatter.getParts(7201)).toEqual({ hours: 2, minutes: 1 });
    });
  });
});
