require('./helper');

vows.describe('HopStopDirections').addBatch({
  var directions, geocoder;

  beforeEach(function() {
    geocoder = jasmine.createSpy('google.maps.Geocoder.geocode');
    directions = new HopStopDirections('A','B','WALKING','now');
  });

  '#steps': {
    'returns an array of steps': function() {
      directions.directionsResult = { routes: [new GoogleDirectionsRoute(HopStopResult.subway)] };
      var steps = directions.steps();

      expect(steps[0].duration.value).toEqual(54);
      expect(steps[1].duration.value).toEqual(688);
      expect(steps[2].duration.value).toEqual(298);
    });
  })

  '#route': {
    var onSuccess, onError;
    beforeEach(function() {
      onSuccess = jasmine.createSpy();
      onError = jasmine.createSpy();
    });
    //'geocodes origin': function() {
    //  directions.route(onSuccess, onError);
    //  expect(geocoder.argsForCall[0][0].address).toBe('A');
    //});
    //'geocodes destination': function() {
    //  directions.route(onSuccess, onError);
    //  expect(geocoder.argsForCall[1][0].address).toBe('B');
    //});
  });

  '#isFullyGeocoded': {
    'returns true if origin and destination are both geocoded': function() {
      directions.x1 = 12;
      directions.y1 = 13;
      directions.x2 = 14;
      directions.y2 = 15;

      expect(directions.isFullyGeocoded()).toBeTruthy();
    })
    'returns false if origin and destination are not geocoded': function() {
      directions.x1 = 12;
      directions.y1 = 13;

      expect(directions.isFullyGeocoded()).toBeFalsy();
    })
  });

  '#onGeocodeOriginSuccess': {
    'sets x1 and y1': function() {
      directions.onGeocodeOriginSuccess(GoogleResult.geocoderResult, function() {}, function() {});
      expect(directions.x1).toBe(40.767436);
      expect(directions.y1).toBe(-73.98177);
    });
    'calls #onGeocodeSuccess': function() {
      var onSuccess = jasmine.createSpy();
      var onError = jasmine.createSpy();
      var onGeocodeSuccess = jasmine.createSpy();
      directions.onGeocodeSuccess = onGeocodeSuccess;

      directions.onGeocodeOriginSuccess(GoogleResult.geocoderResult, onSuccess, onError);
      expect(onGeocodeSuccess).toHaveBeenCalledWith(onSuccess, onError);
    })
  });

  '#onGeocodeDestinationSuccess': {
    'sets x2 and y2': function() {
      directions.onGeocodeDestinationSuccess(GoogleResult.geocoderResult, function() {}, function() {});
      expect(directions.x2).toBe(40.767436);
      expect(directions.y2).toBe(-73.98177);
    });
    'calls #onGeocodeSuccess': function() {
      var onSuccess = jasmine.createSpy();
      var onError = jasmine.createSpy();
      var onGeocodeSuccess = jasmine.createSpy();
      directions.onGeocodeSuccess = onGeocodeSuccess;

      directions.onGeocodeDestinationSuccess(GoogleResult.geocoderResult, onSuccess, onError);
      expect(onGeocodeSuccess).toHaveBeenCalledWith(onSuccess, onError);
    })
  });

  '#isAllWalkingSegments': {
    'returns true if all segments are walking segments': function() {
      directions.segments = function() {
        return [
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
        ]
      };

      expect(directions.isAllWalkingSegments()).toBeTruthy();
    });
    'returns false if at least one segment is not a walking segment': function() {
      directions.segments = function() {
        return [
          new WalkingSegment(0, {}),
          new WalkingSegment(0, {}),
          new SubwayingSegment(0, {}),
          new WalkingSegment(0, {}),
        ]
      };

      expect(directions.isAllWalkingSegments()).toBeFalsy();
    });
  });

  '#onGeocodeSuccess': {
    beforeEach(function() {
      directions.x1 = 1;
      directions.y1 = 2;
      directions.x2 = 3;
      directions.y2 = 4;
      directions.mode = 'WALKING';
      directions.when = 'now';
      fakeAjax({
        urls: { '/hopstops?x1=1&y1=2&x2=3&y2=4&mode=WALKING&when=now' : { successData: HopStopResult.subway } }
      });
    });

    'calculates the route when origin and destination have been geocoded': function() {
      directions.isFullyGeocoded = function() { return true };
      var onSuccess = jasmine.createSpy('onSuccess');

      directions.onGeocodeSuccess(onSuccess);
      expect(onSuccess).toHaveBeenCalled();
    });
    'does not send a hopstop request if both origin/destination are not set': function() {
      directions.isFullyGeocoded = function() { return false };
      var onSuccess = jasmine.createSpy('onSuccess');

      directions.onGeocodeSuccess(onSuccess);
      expect(onSuccess).not.toHaveBeenCalled();
    });
    'sets directionResult on success': function() {
      directions.onGeocodeSuccess(function() {});
      expect(directions.directionsResult.routes.length).toBe(1);
    });
    'runs the onError method on failure': function() {
      fakeAjax({
        urls: { '/hopstops?x1=1&y1=2&x2=3&y2=4&mode=WALKING&when=now' : { errorMessage: 'OMG' } }
      });
      var onError = jasmine.createSpy('onError');
      directions.isFullyGeocoded = function() { return true };

      directions.onGeocodeSuccess(function() {}, onError);
      expect(onError).toHaveBeenCalled();
    });
    'runs the onError method if all segments are walking segments': function() {
      fakeAjax({
        urls: { '/hopstops?x1=1&y1=2&x2=3&y2=4&mode=WALKING&when=now' : { successData: HopStopResult.walking } }
      });
      var onError = jasmine.createSpy('onError');
      directions.isFullyGeocoded = function() { return true };

      directions.onGeocodeSuccess(function() {}, onError);
      expect(onError).toHaveBeenCalled();
    });
  });
});
