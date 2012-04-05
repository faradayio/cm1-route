if(!process.env) process.env = {};

var DirectionsFactory  = require('./directions-factory'),
    FlyingDirections   = require('./directions/flying-directions'),
    GoogleDirections   = require('./directions/google-directions'),
    HopStopDirections  = require('./directions/hop-stop-directions'),
    MapquestDirections = require('./directions/mapquest-directions');

var Cm1Route = module.exports = {
  NumberFormatter: require('./number-formatter'),
  DirectionsFactory: DirectionsFactory,
  FlyingDirections: FlyingDirections,
  GoogleDirections: GoogleDirections,
  HopStopDirections: HopStopDirections,
  MapquestDirections: MapquestDirections
};
