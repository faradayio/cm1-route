var HopStopResult = module.exports ={
  realSubway: {
    duration: {
      text: '21mins',
      value: 1270
    },
    steps: [
      { travel_mode: 'WALKING',
        duration: { text: '53 mins', value: 32400 },
        instructions: 'Start out going North West on Broadway towards Mother Gaston Blvd',
        start_position: {
          lat: 40.6819,
          lon: -73.90871
        },
        end_position: {
          lat: 40.68265,
          lon: -73.91002
        }
      },
      { travel_mode: 'SUBWAYING',
        distance: { value: 1479 },
        duration: { value: 200 },
        instructions: 'Take the J train from Chauncey St station heading to Broad St'
      },
      { travel_mode: 'WALKING',
        distance: { value: 240 },
        duration: { value: 5 },
        instructions: 'Exit near intersection of Canal St and Lafayette St'
      },
      { travel_mode: 'SUBWAYING',
        distance: { value: 948 },
        duration: { value: 18 },
        instructions: 'Take the 6 train from Canal Street station heading Uptown / to Pelham Bay Park'
      },
      { travel_mode: 'WALKING',
        distance: { value: 154 },
        duration: { value: 18 },
        instructions: 'Exit near intersection of E 32nd St and Park Ave',
        start_position: {
          lat: 40.74577,
          lon: -73.98222
        },
        end_position: {
          lat: 40.746824,
          lon: -73.983644
        }
      }
    ]
  },

  subway: {
    duration: {
      text: '21mins',
      value: 1270
    },
    steps: [
      { travel_mode: 'WALKING',
        duration: { value: 54 },
        instructions: 'Go there',
        start_position: {
          lat: 23.546,
          lon: -123.54
        },
        end_position: {
          lat: 23.546,
          lon: -123.54
        }
      },
      { travel_mode: 'SUBWAYING',
        duration: { value: 688 },
        instructions: 'Go there',
        start_position: {
          lat: 23.546,
          lon: -123.54
        },
        end_position: {
          lat: 23.546,
          lon: -123.54
        }
      },
      { travel_mode: 'WALKING',
        duration: { value: 298 },
        instructions: 'Go there',
        start_position: {
          lat: 23.546,
          lon: -123.54
        },
        end_position: {
          lat: 23.546,
          lon: -123.54
        }
      },
    ]
  },
  walking: {
    duration: {
      text: '21mins',
      value: 1270
    },
    steps: [
      { travel_mode: 'WALKING',
        duration: { text: '53 mins', value: 32400 },
        instructions: 'Start out going North West on Broadway towards Mother Gaston Blvd',
        start_position: {
          lat: 40.6819,
          lon: -73.90871
        },
        end_position: {
          lat: 40.68265,
          lon: -73.91002
        }
      },
      { travel_mode: 'WALKING',
        distance: { value: 240 },
        duration: { value: 18 },
        instructions: 'Exit near intersection of Canal St and Lafayette St'
      },
      { travel_mode: 'WALKING',
        distance: { value: 154 },
        duration: { value: 10 },
        instructions: 'Exit near intersection of E 32nd St and Park Ave',
        start_position: {
          lat: 40.74577,
          lon: -73.98222
        },
        end_position: {
          lat: 40.746824,
          lon: -73.983644
        }
      }
    ]
  },
};
