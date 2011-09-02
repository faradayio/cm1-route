var FootprintedRoute = module.exports = function(directions) {
  this.route = directions.steps;
  this.distance = directions.distance;
  this.emissions = this.translateEmissions(directions.totalEmissions);
};

FootprintedRoute.prototype.translateEmissions = function(totalEmissions) {
  var pounds = totalEmissions * 2.20462262;
  var tons = pounds / 2000;
  return {
    kilograms: totalEmissions,
    pounds: pounds,
    tons: tons
  };
};
