function CartisanMap(options) {

  /* Add nicer Style to gMaps-default style */
  var styledMapType = new google.maps.StyledMapType(
  [
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "weight": "2.00"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#9c9c9c"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#7b7b7b"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#c8d7d4"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#070707"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
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
    mapTypeControl:false
  });

  /* Associate the styled map with the MapTypeId and set it to display. */
  this.map.mapTypes.set('styled_map', styledMapType);
  this.map.setMapTypeId('styled_map');
  
  this.options = options;
  this.openMarker = null;
  this.markers = {};

  cartisanMap = this;
  google.maps.event.addListener(this.map, "click", function(event) {
    if(cartisanMap.openMarker != null){
      cartisanMap.openMarker.infowindow.close();
      cartisanMap.openMarker.setIcon(cartisanMap.openMarker.closedIcon);
      cartisanMap.openMarker = null;
    }
  });
}

CartisanMap.prototype.renderMarkers = function(data) {

  // delete all markers still on map
  this.clearMarkers();

  if(data != null){

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < data.length; i++) {

      var markerInfo = data[i]; // have to be variable for access in sub-function

      // convert the coordinates to google maps latlng object
      var coords = data[i].coordinates;
      var latLng = new google.maps.LatLng(coords[0],coords[1]);

      var popupContent = data[i].popupHTML;

      // create the marker
      var marker = new google.maps.Marker({
        position: latLng,
        icon:data[i].icon,
      });

      // create the popup (aka callout)
      marker.infowindow = new google.maps.InfoWindow({
        content: popupContent,
        maxWidth: this.options.infoWindowWidth
      });

      marker.infowindow.marker = marker;

      // listen to closeclick to change icon
      marker.infowindow.addListener('closeclick', function() {
        this.marker.setIcon(markerInfo.icon);
      });

      marker.cartisanMap = this;
      marker.closedIcon = markerInfo.icon;

      marker.open = function(openPopup) {

        if(this == cartisanMap.openMarker){
          this.infowindow.close();
          cartisanMap.openMarker = null;
          this.setIcon(markerInfo.icon);
          return;
        }

      	openPopup = (typeof openPopup !== 'undefined') ?  openPopup : false;

        // close other popups
        if (cartisanMap.openMarker) {
          cartisanMap.openMarker.infowindow.close();
          cartisanMap.openMarker.setIcon(markerInfo.icon);
        }

        cartisanMap.openMarker = this;

        // zoom in to max, if previously detected as overlapping
        if(this.overlapping &&   cartisanMap.map.getZoom() != cartisanMap.map.maxZoom){
        	cartisanMap.map.setZoom(cartisanMap.map.maxZoom);
        	cartisanMap.map.panTo(this.getPosition());
        }

        // handle overlapping markers
        var detectedOverlap = false;

        // overlapping markers can only occure when no clustering
        if(cartisanMap.map.getZoom() > cartisanMap.markerCluster.getMaxZoom()){
        
	        var overlapCounter = 1;
	        var shiftDistanceLng = 0.0005;
	        var shiftDistanceLat = 0.0005;
	        var rowCounter = 0;
	        
	        // loop through all markers, if overlapping move by offset
	        for (var key in cartisanMap.markers) {
				    if (cartisanMap.markers.hasOwnProperty(key) && cartisanMap.markers[key] != this) {

		        	var otherMarkerPos = cartisanMap.markers[key].getPosition();
		        	var thisMarkerPos = this.getPosition();

		        	// if overlapping
	            if (otherMarkerPos.equals(thisMarkerPos)) {

	            	// zoom to max
	            	cartisanMap.map.setZoom(cartisanMap.map.maxZoom);

	            	// add overlapping atribute to marker
	            	cartisanMap.markers[key].overlapping = true;
	            	this.overlapping = true;

	            	// change position of the other marker

								var lngMult = 1;				
								if(overlapCounter%2==1){
									lngMult = -1*Math.ceil(overlapCounter/2);
								}else{
									lngMult = overlapCounter/2;
								}

								var latMult = 0;//Math.floor((overlapCounter)/5);

								cartisanMap.markers[key].setPosition({lat: otherMarkerPos.lat() + latMult * shiftDistanceLat, lng: otherMarkerPos.lng()+lngMult*shiftDistanceLng});
	            	detectedOverlap = true;
	            	overlapCounter++;
					    }
						}
					}
				}

				// do not open popup if overlap is detected
				if(detectedOverlap && !openPopup)
					return;

        cartisanMap.openMarker.infowindow.open(cartisanMap.map, this);

        // change the icon
        this.setIcon(markerInfo.iconOpen);
      }

      marker.addListener('click', marker.open);

      marker.addListener('mouseover', function() {
      	if(this != this.cartisanMap.openMarker){
      		console.log("mouseover");
      		this.setIcon(markerInfo.iconHover);
      	}
      });

      marker.addListener('mouseout', function() {

      	if(this != this.cartisanMap.openMarker){
      		      	      	console.log("mouseout");

      		this.setIcon(markerInfo.icon);
      	}
      });

      // save markers in a list, so theay can be accessed from outside
      this.markers[data[i].markerID] = marker;

      // for calculating bounds of view
      bounds.extend(marker.getPosition());
    }

    // adjust zoom and bounds so that view contains all markers
    this.map.fitBounds(bounds);

    // clusterer options
    mcOptions = {
      styles: this.options.clusterIcons,
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

  //var markerClust2 = new MarkerClusterer(map, [marker], {});
  this.map.panTo(marker.getPosition());

  // has to be above markerclusterer maxZoom markers are displayed seperately
  this.map.setZoom(14); 
  marker.open(true);
}