var FlyingDirections = require('./directions/flying-directions'),
    GoogleDirections = require('./directions/google-directions'),
    MapquestDirections = require('./directions/mapquest-directions');

var DirectionsFactory = module.exports = {
  create: function(origin, destination, mode, day, time) {
    if(mode == 'PUBLICTRANSIT' || mode == 'SUBWAYING' || mode == 'BUSSING') {
      return new MapquestDirections(origin, destination, mode, day, time);
    } else if(mode == 'FLYING') {
      return new FlyingDirections(origin, destination, mode);
    } else {
      return new GoogleDirections(origin, destination, mode);
    }
  }
};

