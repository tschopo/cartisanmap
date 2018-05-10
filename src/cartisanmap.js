function CartisanMap(options) {

  /* Add nicer Style to gMaps-default style */
  var styledMapType = new google.maps.StyledMapType(
  [
      {
          "featureType": "administrative.province",
          "elementType": "all",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "weight": "1.79"
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#C5E3BF"
              }
          ]
      },
      {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
              {
                  "lightness": 100
              },
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#D1D1B8"
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#ffeeaa"
              },
              {
                  "visibility": "on"
              },
              {
                  "weight": "1.18"
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#e9ac77"
              },
              {
                  "visibility": "on"
              },
              {
                  "weight": "0.65"
              }
          ]
      },
      {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#C6E2FF"
              }
          ]
      }
  ],
  {name: 'Cartisan Map'});

  /* Initialize google maps object */
  this.map = new google.maps.Map(document.getElementById(options.mapID), {
    center: {lat: 40.04130429, lng: 45.62966304},
    zoom: 8,
    maxZoom: 17, // limit zooming in
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false

  });

  /* Associate the styled map with the MapTypeId and set it to display. */
  this.map.mapTypes.set('styled_map', styledMapType);
  this.map.setMapTypeId('styled_map');

  this.options = options;
  this.infowindow = null;
  this.markers = {};
}

CartisanMap.prototype.renderMarkers = function(data) {

  // delete all markers still on map
  this.clearMarkers();

  if(data != null){

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < data.length; i++) {

      var markerInfo = data[i]; // have to be variable for access in sub-function

      // convert the coordinates too google maps latlng object
      var coords = data[i].coordinates;
      var latLng = new google.maps.LatLng(coords[0],coords[1]);

      var popupContent = data[i].popupHTML;

      // create the marker
      var marker = new google.maps.Marker({
        position: latLng,
        icon:data[i].iconUrl,
      });

      // create the popup (aka callout)
      marker.infowindow = new google.maps.InfoWindow({
        content: popupContent,
        maxWidth: this.options.infoWindowWidth
      });

      marker.infowindow.marker = marker;

      // listen to closeclick to change icon
      marker.infowindow.addListener('closeclick',function(){
        this.marker.setIcon(markerInfo.iconUrl);
      });

      marker.cartisanMap = this;

      marker.open = function() {

        // close other popups
        if (cartisanMap.openMarker) {
          cartisanMap.openMarker.infowindow.close();
          cartisanMap.openMarker.setIcon(markerInfo.iconUrl);
        }

        //map.setCenter(marker.getPosition());
        cartisanMap.openMarker = this;
        cartisanMap.openMarker.infowindow.open(cartisanMap.map, this);

        // change the icon
        this.setIcon(markerInfo.iconOpenUrl);
      }

      marker.addListener('click', marker.open);

      // save markers in a list, so theay can be accessed from outside
      this.markers[data[i].markerID] = marker;

      // for calculating bounds of view
      bounds.extend(marker.getPosition());
    }

    // adjust zoom and bounds so that view contains all markers
    this.map.fitBounds(bounds);

    // clusterer options
    mcOptions = {
      styles: [
        {
          url: this.options.clusterIcons[0].url,
          height: this.options.clusterIcons[0].size,
          width: this.options.clusterIcons[0].size
        },{
          url: this.options.clusterIcons[1].url,
          height: this.options.clusterIcons[1].size,
          width: this.options.clusterIcons[1].size
        },{
          url: this.options.clusterIcons[2].url,
          height: this.options.clusterIcons[2].size,
          width: this.options.clusterIcons[2].size
        },{
          url: this.options.clusterIcons[3].url,
          height: this.options.clusterIcons[3].size,
          width: this.options.clusterIcons[3].size
        }],
      maxZoom: 13, // disable clustering above 13
      gridSize: 100,
      calculator: function(markers, numStyles){     // custom cluster algorithm as described in site spec

        //create an index for icon styles
        var index = 0;

        //Count the total number of markers in this cluster
        var count = markers.length;

        if(count <= 5)
          index = 1;
        else if(count <= 12)
          index = 2;
        else if(count <= 22)
          index = 3;
        else 
          index = 4;

        //Tell MarkerCluster the clusters details (and how to style it)
        return {
            text: count,
            index: index
        };
      }
    };

    this.markerCluster = new MarkerClusterer(this.map, this.markers, mcOptions);

    // fix markerclusterer fitbounds-bug 
    var mc = this.markerCluster;

    setTimeout(function() {
      mc.resetViewport();
      mc.redraw();
    },500);
  }
}

CartisanMap.prototype.clearMarkers = function() {

  if(this.markerCluster){
    this.markerCluster.clearMarkers();
  }

  for(var markerID in this.markers) {
    this.markers[markerID].setMap(null);
    this.markers[markerID] = null;
  }
  this.markers = {};
}

CartisanMap.prototype.openPopup = function(markerID) {

  var marker = this.markers[markerID];
  //markerCluster.removeMarker(marker);
  cartisanMap.openMarker = marker;

  //var markerClust2 = new MarkerClusterer(map, [marker], {});
  this.map.panTo(marker.getPosition());

  // has to be above markerclusterer maxZoom markers are displayed seperately
  this.map.setZoom(14); 
  marker.open();
}