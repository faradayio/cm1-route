var Segment = module.exports = function() {};

Segment.prototype.getEmissionEstimateWithSegment = function(onSuccess, onError) {
  this.getEmissionEstimate(
    Segment.events.onGetEmissionEstimateWithSegmentSuccess(this, onSuccess),
    Segment.events.onGetEmissionEstimateWithSegmentError(this, onError));
};

// Events

Segment.events = {
  onGetEmissionEstimateWithSegmentSuccess: function(segment, onSuccess) {
    return function(emissionEstimate) {
      onSuccess(segment, emissionEstimate);
    };
  },
  onGetEmissionEstimateWithSegmentError: function(segment, onError) {
    return function() {
      onError(segment, this);
    };
  }
};
