var DirectionsEvents = module.exports = function() {
  // Geocode using GMaps API and assign first result to property
  this.geocode = function(directions, addressProperty, property) {
    return function(callback) {
      var address = directions[addressProperty];
      directions.geocoder.geocode({ address: address }, function(results) {
        directions[property] = results[0].geometry.location;
        callback(null, results);
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
