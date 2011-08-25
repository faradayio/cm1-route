require('./helper');

vows.describe('Url').addBatch({
  'get': {
    'decodes the URL': function() {
      Url.actual = function() { return 'http://hootroot.com/#!/a%20b%20c/d%20e%2C%20f'; };
      expect(Url.spi()).toBe('/a b c/d e, f');
    });
  });

  'spi': {
    'returns null if there is no SPI path': function() {
      Url.get = function() { return 'http://hootroot.com' };
      expect(Url.spi()).toBeNull();
    });
    'does not mistakenly translate URLs with names': function() {
      Url.get = function() { return 'http://hootroot.com/#foo' };
      expect(Url.spi()).toBeNull();
    });
    'returns the SPI path': function() {
      Url.get = function() { return 'http://hootroot.com/#!/foo/bar baz' };
      expect(Url.spi()).toBe('/foo/bar baz');
    });
  });

  '.getSpiPathParameter': {
    'returns null if there is no SPI': function() {
      Url.get = function() { return 'http://hootroot.com' };
      expect(Url.getSpiPathParameter('a')).toBeNull();
    });
    'returns null if there is no "to" parameter': function() {
      Url.get = function() { return 'http://hootroot.com/#!/a/b' };
      expect(Url.getSpiPathParameter('b')).toBeNull();
    });
    'returns the named parameter': function() {
      Url.get = function() { return 'http://hootroot.com/#!/a/b/c/d' };
      expect(Url.getSpiPathParameter('c')).toBe('d');
    });
  });

  'origin': {
    'returns the "from" parameter': function() {
      Url.get = function() { return 'http://hootroot.com/#!/from/600 Jenison Ave, Lansing, MI 48915/to/860 Abbott Rd, Ste 4, East Lansing, MI' };
      expect(Url.origin()).toBe('600 Jenison Ave, Lansing, MI 48915');
    });
  });

  'destination': {
    'returns the "to" parameter': function() {
      Url.get = function() { return 'http://hootroot.com/#!/from/600 Jenison Ave, Lansing, MI 48915/to/860 Abbott Rd, Ste 4, East Lansing, MI' };
      expect(Url.destination()).toBe('860 Abbott Rd, Ste 4, East Lansing, MI');
    });
  });

  'baseUrl': {
    'returns a plain URL': function() {
      Url.get = function() { return 'http://hootroot.com' };
      expect(Url.baseUrl()).toBe('http://hootroot.com/');
    });
    'ignores lonely hashes': function() {
      Url.get = function() { return 'http://hootroot.com/#' };
      expect(Url.baseUrl()).toBe('http://hootroot.com/');
    });
    'returns a base URL from a SPI URL': function() {
      Url.get = function() { return 'http://hootroot.com/#!/foo/bar' };
      expect(Url.baseUrl()).toBe('http://hootroot.com/');
    });
  });

  'generate': {
    'encodes addresses with spaces': function() {
      document.URL = 'http://hootroot.com/#!/foo/bar';
      expect(Url.generate('123 Main St, Anytown, US', '321 Maple St')).
        toBe('http://hootroot.com/#!/from/123%20Main%20St%2C%20Anytown%2C%20US/to/321%20Maple%20St');
    });
  });
});
