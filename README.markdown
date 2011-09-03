# Installation

Copy cm1-route.js into your JavaScript assets directory.

In your HTML:

    <script type="text/javascript" src="javascript_assets_directory/cm1-route.js"></script>

# Usage

`Cm1Route` provides four functions for calculating routes (one for each mode). Each function takes a single parameter that is an object containing options, `success`, `failure`, and `loading`. Each option is a callback (or anonymous function) that is run when certain events occur. When routing is successfully finished, the callback is given an instance of a `Route` which provides a `totalDistance` property and a `draw` function that will draw the route on a map contained within the specified element. While the calculation is being performed, the optional loading callback is run that will allow you to display a loading status message. The failure callback is called when there is a problem obtaining a route. A parameter containing an error message is passed in.

    <script type="text/javascript" src="javascript_assets_directory/cm1-route.js"></script>

    <script type="text/javascript">
      var route = new Cm1Route('Chicago, IL', 'New York, NY');
      route.routeAutomobile({
        success: function(route) {
          alert('Total distance: ' + route.totalDistance);
          route.draw('#mapelement');
        },
        failure: function(error) {
          alert('Failed because ' + error);
        },
        loading: function() {
          alert("I'm working on it!");
        }
      });
    </script>

