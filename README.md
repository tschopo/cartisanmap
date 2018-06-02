Cartisan Map
==================================

## Dependencies

- [markerclusterer.js](src/markerclusterer.js)
- [https://maps.googleapis.com/maps/api/js](https://maps.googleapis.com/maps/api/js)

## Doc

### Settings

Pass to constructor, or set directly via CartisanMap.options.

Refer to [clusterer doc](https://googlemaps.github.io/js-marker-clusterer/docs/reference.html) for cluster-styles.

```js
var cartisanMapOptions = {
  mapID : "map",        // the html id of map div
  infoWindowWidth: 200, // width of the pop-ups in px (int)
  clusterIcons: [ // cluster styles
    {
      url:"cluster1.png", // smallest icon, absolute url, or relative to document (string)
      width: 40,          
      height: 40,
    },{
      url:"cluster2.png",
      width: 50,          // width = height, in pixels (int)
      height: 50,
    },{
      url:"cluster3.png",
      width: 65,
      height: 65
    },{
      url:"cluster4.png", // largest icon
      width: 80,
      height: 80
    }
  ]
};
```

### Create the map
Create an empty map with cartisan map style.

`
var cartisanMap = new CartisanMap(cartisanMapOptions);
`

### Render markers
Renders the markers (see below for `markers` spec) and sets the map to fit all markers.

`
cartisanMap.renderMarkers(markers);
`

### Zoom to marker and open popup
```js
markerID = '1';
cartisanMap.openPopup(markerID)
```

### Markers spec

Refer to [Google Maps symbol Doc](https://developers.google.com/maps/documentation/javascript/symbols) for soppurted icon symbol styles, and  [Google Maps Icon doc](https://developers.google.com/maps/documentation/javascript/markers#complex_icons) for supported icon styles.
```js
var exampleMarkers = [
{
  "markerID":"1", // his id is used to zoom in on marker with openPopup(markerID)
  "icon":{ // png style
    url: 'icon.png',
    size: new google.maps.Size(20, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 32)
  }, 
  "iconOpen":{ // svg style
    path: 'M -2,0 0,-2 2,0 0,2 z',
    strokeColor: '#F00',
    fillColor: '#F00',
    fillOpacity: 1,
    scale: 5
  },
  "popupHTML":"<div class='popup'><h2 class='popup-project-title'>Down-sized coherent open system</h2><span class='popup-info-col'><i class='fa fa-industry'></i></span>Telecommunications Equipment<br /><span class='popup-info-col'><i class='fa fa-clock-o'></i> </span>4/26/2010<span class='popup-info-enddate'><i class='fa fa-flag'></i></span>1/3/2035<br /><button class='view-project-button'>View project</button></div>", // the pop html
  "coordinates": [40.04130429,45.62966304] // lat, lng
}, 
{
  "markerID":"2",
  "icon":{ // png style
    url: 'icon.png',
    size: new google.maps.Size(20, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 32)
  }, 
  "iconOpen":{ // svg style
    path: 'M -2,0 0,-2 2,0 0,2 z',
    strokeColor: '#F00',
    fillColor: '#F00',
    fillOpacity: 1,
    scale: 5
  },
  "popupHTML":"<div class='popup'><h2 class='popup-project-title'>Proactive bi-directional circuit</h2><span class='popup-info-col'><i class='fa fa-industry'></i></span>n/a<br /><span class='popup-info-col'><i class='fa fa-clock-o'></i> </span>4/8/2016<span class='popup-info-enddate'><i class='fa fa-flag'></i></span>8/17/2027<br /><button class='view-project-button'>View project</button></div>",
  "coordinates": [40.3159495,44.43132324]
},
];
```

## Example
[example/example.html](example/example.html)
