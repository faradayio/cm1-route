var NativeRoute = module.exports = function() {};

NativeRoute.prototype.automobile = function() {
  return {
    totalDistance: 100,
    segments: []
  };
};

NativeRoute.prototype.bus = function() {
  return {
    totalDistance: 100,
    segments: []
  };
};

NativeRoute.prototype.flight = function() {
  return {
    totalDistance: 100,
    segments: []
  };
};

NativeRoute.prototype.rail = function() {
  return {
    totalDistance: 100,
    segments: []
  };
};

module.exports = NativeRoute;
