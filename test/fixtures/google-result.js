var Geocode = function() {
  this.geometry = {
    location: {
      lat: function() { return -73.98177; },
      lng: function() { return 40.767436; }
    }
  }
}

var GoogleResult = module.exports = {
  geocoderResult: [new Geocode],
  driving: {
    routes: [{
      summary: 'I-96E',
      legs: [{
        distance: {
          text: '66.3 mi',
          value: 106738
        },
        duration: {
          text: '1 hour 9mins',
          value: 4158
        },
        end_address: 'Ann Arbor, MI, USA',
        start_address: 'Lansing, MI, USA',
        steps: [
          { travel_mode: 'DRIVING',
            distance: { value: 688 },
            duration: { value: 30 },
            instructions: 'Go there' },
          { travel_mode: 'DRIVING',
            distance: { value: 128 },
            duration: { value: 2 },
            instructions: 'Go there' },
          { travel_mode: 'DRIVING',
            distance: { value: 45 },
            duration: { value: 1 },
            instructions: 'Go there' },
          { travel_mode: 'DRIVING',
            distance: { value: 9025 },
            duration: { value: 300 },
            instructions: 'Go there' },
        ]
      }]
    }]
  },
  walking: {
    routes: [{
      summary: 'W Oakland Rd',
      legs: [{
        distance: {
          text: '1.4 mi',
          value: 2253
        },
        duration: {
          text: '27mins',
          value: 1620
        },
        end_address: '1132 N Washington, Lansing, Michigan 48906',
        start_address: '610 Westmoreland Ave, Lansing, MI 48915',
        steps: [
          { travel_mode: 'WALKING',
            distance: { value: 321 },
            duration: { value: 300 },
            instructions: 'Go there' },
          { travel_mode: 'WALKING',
            distance: { value: 1609 },
            duration: { value: 1600 },
            instructions: 'Go there' },
          { travel_mode: 'WALKING',
            distance: { value: 321 },
            duration: { value: 300 },
            instructions: 'Go there' }
        ]
      }]
    }]
  }
}
