var DirectionsEvents = module.exports = function() {
  // Geocode using GMaps API and assign first result to property
  this.geocode = function(directions, addressProperty, property) {
    return function(callback) {
      var address = directions[addressProperty];

      if(address.lat) {
        directions[property] = address;
        return callback(null, [{geometry: { location: address }}]);
      }

      directions.geocoder.geocode({ address: address }, function(results) {
        if(results.length > 0) {
          directions[property] = results[0].geometry.location;
          callback(null, results);
        } else {
          var err = new DirectionsEvents.GeocodeError('Google returned no geocoding results for ' + address);
          callback(err, directions);
        }
      });
    };
  };

  this.onSegmentGetEmissionEstimate = function(directions, segmentCallback, asyncCallback) {
    return function(err, emissionEstimate) {
      directions.totalEmissions += emissionEstimate.value();
      if(segmentCallback) segmentCallback(err, emissionEstimate);
      asyncCallback(err);
    };
  };
};

DirectionsEvents.GeocodeError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'GeocodeError';
  this.message = (message) ? message : 'Failed to goecode';
};
