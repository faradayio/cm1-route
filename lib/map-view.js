var googleMaps = require('googlemaps');

var MapView = module.exports = function(mapId) {
  this.mapId = mapId
  var ll = new google.maps.LatLng(39.57, -97.82)
  this.options = {
    zoom: 4,
    center: ll,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  this.canvas = document.getElementById(this.mapId);

  return true
}

MapView.prototype.googleMap = function () {
  if(this.google_map == null) {
    this.google_map = new googleMaps.Map(this.canvas, this.options)
  }
  return this.google_map
}

MapView.prototype.resize = function() {
  this.canvas.width('100%')
  this.canvas.height('100%')
}
