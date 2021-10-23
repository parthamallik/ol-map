import 'ol/ol.css';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import Point from 'ol/geom/Point';
import Polyline from 'ol/format/Polyline';
import { transform } from 'ol/proj';
import { Icon, Stroke, Style, Text, RegularShape } from 'ol/style';
import LineString from 'ol/geom/LineString';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Overlay from 'ol/Overlay';

import { distances, coordinates, aid_stations, getLatLongFromDistance } from './route-info.js'


var vectorSource = new VectorSource(),
  vectorLayer = new VectorLayer({
    source: vectorSource
  }),
  styles = {
    route: new Style({
      stroke: new Stroke({
        width: 6, color: [14, 64, 18, 0.8]
      }),
    }),
    rectangle: (text) => {
      return new Style({
        image: new RegularShape({
          fill: new Fill({
            color: "#c2f2e0"
          }),
          stroke: new Stroke({
            color: [5, 51, 34, 1],
            width: 1
          }),
          radius: 200 / Math.SQRT2,
          radius2: 200,
          points: 4,
          angle: 0,
          scale: [0.9, 0.5],
        }),
        text: new Text({
          text: text,
          font: '8px monospace',
          textAlign: "center",
          scale: 2.2,
          fill: new Fill({
            color: "#053322"
          })
        })
      })
    },
    icon: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'data/marker3.png'
      }),
    }),

    icon2: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'data/start-marker.png'
      }),
    })
  };

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    vectorLayer
  ],
  view: new View({
    center: [8657171.159654377, 1449369.2919883956],
    zoom: 13
  })
});

var utils = {
  gettiming: function () {
    return new Promise(function (resolve, reject) {
      //make sure the coord is on street
      fetch('data/runners.csv').then(function (response) {
        // Convert to JSON
        resolve(response.text());
      }).catch(function (e) { reject(e); });
    });
  },

  createFeature: function (coord, style, name) {
    var feature = new Feature({
      name: name,
      type: 'place',
      geometry: new Point(fromLonLat(coord))
    });
    feature.setStyle(style);
    vectorSource.addFeature(feature);
    return feature;
  },
  createRoute: function (polyline) {
    // route is ol.geom.LineString
    var route = new Polyline({
      factor: 1e5
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    var feature = new Feature({
      type: 'route',
      geometry: route
    });
    feature.setStyle(styles.route);
    vectorSource.addFeature(feature);
  },
  to4326: function (coord) {
    return transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  }
};

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

// create the route
let lines = new Feature({
  geometry: new LineString(coordinates.map(c => fromLonLat(c))),
  name: 'Line',
});

lines.setStyle(styles.route);
vectorSource.addFeature(lines);


function csvJSON(csv) {
  var lines = csv.split("\n");
  var result = [];
  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {

    var obj = {};
    var currentline = lines[i].split(",");

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);

  }
  return result;
}

let getPrediction = (runner) => {
  if(runner.TIME && runner.MARK) {
    let sT = Date.parse(`Wed Oct 23 2021 4:30:00 GMT+0530 (India Standard Time)`); // start time
    let eT = Date.parse(`Wed Oct 23 2021 ${runner.TIME}:00 GMT+0530 (India Standard Time)`); // elapsed time
    let d_p = ( distances[aid_stations[runner.MARK]] / (eT-sT) ) * (Date.now()  - sT); // distance_predicted
    if(d_p > distances[aid_stations[Number(runner.MARK) + 1]]) { // if crossing next mark, keep it to 85-97% of it
      d_p = (distances[aid_stations[Number(runner.MARK) + 1]] * Math.floor(Math.random() * (97 - 85 + 1) + 85)) / 100;
    }
    return getLatLongFromDistance (d_p); // get lat long for it
  } else if(runner.MARK) { // time not captured.
    coordinates[aid_stations[runner.MARK]]; // whichever is the last aid station marked
  } else {
    coordinates[0] // no MARK means, not started
  }
}


var markerFeature = [];
document.getElementById("select").addEventListener("change", (e) => {
  var val = document.getElementById("select").value;
  let splits = val.split(' | ');
  let runner = runners.filter(r => r.NAME === splits[0]);

  runner = (val === '- ALL -') ? runners : runner;
  if(runner.length === 0) return;

  markerFeature.forEach(m=> {
    vectorSource.removeFeature(m);
  })
  markerFeature = [];
  $(element).popover('dispose');
  runner.forEach (r => {
    //console.log(r);
    if (r.MARK) markerFeature.push(utils.createFeature(getPrediction(r), styles.icon, r.BIB));
  })
});

var getExpTime = (km, t) => {
  let sT = Date.parse(`Wed Oct 31 2021 4:30:00 GMT+0530 (India Standard Time)`);
  let cT = Date.parse(`Wed Oct 31 2021 ${t}:00 GMT+0530 (India Standard Time)`);
  let expT = ((cT - sT) / km) * 50000;
  return (new Date(sT + expT)).toLocaleString().split(', ')[1];
}

var runners = [];
utils.gettiming().then(function (d) {
  runners = csvJSON(d);
  var datalist = document.getElementById("runners");
  datalist.innerHTML += `<option value="- ALL -"></option>`;
  runners.forEach(d => {
    // create the remaining
    datalist.innerHTML += `<option value="${d.NAME} | ${d.BIB}"></option>`;
  });
});

utils.createFeature([77.7048069, 12.9065275], styles.icon2, 'Startpoint');

map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  if (feature && feature.get('name') && feature.get('name').startsWith('B42SE')) {
    popup.setPosition(evt.coordinate);
    let runner = feature.get('name') ? runners.filter(r => r.BIB === feature.get('name')) : null;
    if (runner && runner.length > 0) runner = runner[0];

    let name = runner.NAME,
      distance = distances[aid_stations[runner.MARK]] / 1000,
      exptime = getExpTime(distances[aid_stations[runner.MARK]], runner.TIME);

    $(element).popover({
      placement: 'top',
      html: true,
      content: `<div>${name}</div><div> Distance: ${Math.round(distance * 100) / 100} km</div><div>ETA: ${exptime} HRS</div>`
    });
    $(element).popover('show');
  } else {
    $(element).popover('dispose');
  }
});