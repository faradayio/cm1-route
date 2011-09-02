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

  this.onSegmentEmissionsSuccess = function(directions, onSuccess, onFinish) {
    return function(segment, emissionEstimate) {
      directions.totalEmissions += emissionEstimate.value();
      onSuccess(directions.mode, segment, emissionEstimate);

      directions.segmentEmissionsSuccessCount++;
      if(onFinish && directions.segmentEmissionsSuccessCount == directions.segments().length)
        onFinish(directions);
    };
  };

  this.onRouteWithEmissionsEmissionsSuccess = function(onSuccess) {
    return function(directions) {
      var data = new FootprintedRoute(
          directions.routeDetails,
          directions.distanceEstimate(),
          directions.totalEmissions);

      onSuccess(data);
    }
  };
};
