global.vows = require('vows');
global.assert = require('assert');
global.sinon = require('sinon');

var jsdom = require('jsdom');

var Cm1Result = require('./fixtures/cm1-result');

global.setHtmlFixtures = function(html) {
  html = '<html><head></head><body>' + html + '</body></html>';
  window = jsdom.jsdom(html).createWindow();
  global.window = window;
  global.document = window.document;
}

global.navigator = {
  userAgent: 'jasmine'
};
global.location = { href: "http://monitoring" };
setHtmlFixtures();
global.document.location = global.location;

assert.approximately = function(test, base, deviation) {
  if(!deviation) deviation = 0;

  var lowerBound = base - deviation
  var upperBound = base + deviation
  assert.isTrue(test >= lowerBound, 'Expected ' + test + ' to be approximately ' + base + ', within ' + deviation);
  assert.isTrue(test <= upperBound, 'Expected ' + test + ' to be approximately ' + base + ', within ' + deviation);
};

var LatLng = function(lat, lon) {
  this.lat = function() { return lat; };
  this.lng = function() { return lon; };
};
var LatLngBounds = function(sw, ne) {
  this.getSouthWest = function() { return sw; };
  this.getNorthEast = function() { return ne; };
};

global.google = {
  maps: {
    Geocoder: function() {
      return {
        geocode: function(options, callback) {
          callback([{ geometry: { location: new LatLng(1, 1) } }]);
        }
      };
    },
    LatLng: LatLng,
    LatLngBounds: LatLngBounds,
    MapTypeId: { ROADMAP: 'ROADMAP' },
    DirectionsStatus: {
      OK: 'OK'
    },
    DirectionsService: function() {
      this.route = function(result, callback) {
        callback(Cm1Result.fit);
      };
    },
    geometry: {
      spherical: {
        computeDistanceBetween: function(a, b) { return 764872.7; }
      }
    }
  }
};
