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

  createFeature: function (coord, style) {
    var feature = new Feature({
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

var geom = [
  "gywmAqxgyMiKuAmJ}B}EqCsBuCgD_`@pCkH{IwEuJkOGkClA}I_AqFj@gC]eKaIsEsAiCiEkr@_BeEDaEmIJfAuLa@iGfAuCFsF",
  "wnzmAw}nyMpDeg@lFqa@\\uSvAqPtFw\\nBsClEoC",
  "mlymAsusyMHYV{CL}Cb@}B|@}CdGgP~DcENi@VkAl@cGZ}A@q@_@sC",
  "awxmAmuuyMq@_Bu@WMMEiCR}DTeAdDqFx@{B`@_Cx@cHf@cDd@cG",
  "imxmA{kwyMhAuL|AyHg@{Db@gJtDaFl@kE[oMb@s@rA[d@kB`BkBj@cC~EwBpOqQfQog@",
  "wnvmAs|{yM`BuBxIiHfJ_G~BwQl@gB~AkChAwDAoAe@_BgCcDEiDPq@^}SZ_BzB_GFo@Uu@oEgEkA_BeB}K",
  "wvumAq|_zMaY|Ksb@Pi`@xEqOdGoHFcDbDqYo@yNwDgEM{CxAwO}A",
  "e{{mAob_zMgFjJeDlKVfImMtBw@jAwHhEsZ`KuHc@{EbAkI?wNyBmNjBgBjD",
  "yy_nAab}yMMhBj@lALhBs@nCeDdEe@bAwDc@YZaApEaFgAaANuHdE}DtCgDlD",
  "aganAiw{yMYZVp@l@tDF~ACrBIVTF",
  "eeanAqg{yMjKdB~Mv@Cd@bOXfFEPL",
  "_r_nAk`{yMLFCtBYf@[nDeAzBi@ZC^j@x@Az@WxAAhBeBhI",
  "uy_nAy{yyM|Js@vSs@lALpDvA~Er@",
  "_j~mAgzyyMe@xGc@pD[xJAvE",
  "gm~mAiyxyMADp@`@bDJDV[vDJt@x@d@Px@@bAO`C?z@jAh@Cv@Pb@nBH",
  "u~}mA}_xyMInAPf@`AfAHf@KpEeAtCt@EjA\\tCRhD~@tDDx@i@nDE|@WrBR",
  "_~|mAokwyMdBL~AOnDXXLJRJ~BPN~BhAlFdDrE`BxEtB\\I@P",
  "{dymAq|uyM`Fv@v@\\h@FLLt@VfEgAfBIf@VdAnAdA\\zC`@t@\\",
  "}bxmAytuyM[v@o@jEs@RBzA\\N_@zBSl@",
  "ogxmAkcuyM@bA`ArA~BfBr@jEx@V|@xB`ALtBKt@n@k@|BeAXSb@]rBVzB|@`TjBr@pE`AfCbAlYvE",
  "knvmA{_syMtF`P|Qt@tHSjGn@hM[hIh@~JjC~DnBrAUdDv@fOrF",
  "__smAg{qyMrGzArIfFhETtGbCtAzA_@|F`@xGrF`GbRdDbKpGbNfEvV|J`NjD",
  "e}nmAikoyMDt@_@pFB~BLVvAf@Jv@jB`A\\fBkAbJQbDhCjAN\\]rFaAjAkA`EkBpK",
  "{|nmAydmyMQhA?|BnAhULdEMdGtApSPpROXA~DHjAbBzBaAbG?pB\\vCbBtG|DbBPn@UvAPXfDAYtD",
  "_hnmAw}hyMjEh@uJ`Pu@dEmFzGcUv@{LrCeSjGcNhI_Q`AwJxHyNdGyLrA}OpE",
  "ajsmA_ffyMsEdBsBb@mCUmG\\_BPkB|@eDIq@NkAx@_EE_A`@",
  "uxtmAa|eyMY]Hm@EMiA[cCwCQa@G_@Hc@xAwEE_@Yk@gI_EyBg@IODY[a@c@wAe@aAGF",
  "cpumA__gyM`BsGv@uF^gBpAoBmByA",
  "ekumA{xgyMuBU}RmFiCAaKpAiH?",
  "o|vmAo~gyM[DqBnEmCzE_@M",
  "kfwmAkqgyMyOqE"
];


var coordinates = [
  fromLonLat([77.781695, 12.926608]),
  fromLonLat([77.781591, 12.926517]),
  fromLonLat([77.781218, 12.925225]),
  fromLonLat([77.779325, 12.921577]),
  fromLonLat([77.778735, 12.920305]),
  fromLonLat([77.777723, 12.917529]),
  fromLonLat([77.777852, 12.917294]),
  fromLonLat([77.777674, 12.916155]),
  fromLonLat([77.777433, 12.91482]),
  fromLonLat([77.777636, 12.914807]),
  fromLonLat([77.777535, 12.913592])
];


var aid = [
  {
    'distance': 4,
    'latlog': [77.736183, 12.919204] // 4 km
  },
  {
    'distance': 9,
    'latlog': [77.776916, 12.911674]// 9 km
  }, {
    'distance': 14.7,
    'latlog': [77.82325, 12.894633] // 14.7 km
  }, {
    'distance': 16,
    'latlog': [77.826518, 12.901095] // 16 km
  }, {
    'distance': 20.4,
    'latlog': [77.8163, 12.93515] // 20.4 km
  }, {
    'distance': 24.4,
    'latlog': [77.804259, 12.951332] // 24.4 km
  }, {
    'distance': 28.2,
    'latlog': [77.7848, 12.935627] // 28.2 km
  }, {
    'distance': 31,
    'latlog': [77.777191, 12.910722] // 31 km
  }, {
    'distance': 33,
    'latlog': [77.764322, 12.905359], // 33 km
  }, {
    'distance': 35.9,
    'latlog': [77.756916, 12.882096], // 35.9 km
  }, {
    'distance': 38.8,
    'latlog': [77.743987, 12.861141], // 38.8 km
  }, {
    'distance': 40.2,
    'latlog': [77.732595, 12.861153], // 40.2 km
  }, {
    'distance': 43,
    'latlog': [77.732606, 12.861149], // 43 km
  }, {
    'distance': 46.5,
    'latlog': [77.69711, 12.8837], // 46.5 km
  },
  {
    'distance': 48.2,
    'latlog': [77.701236, 12.894834] // 48.2 km
  }
]


// Create the mixed map
for (let x = 0; x < geom.length; x++) {
  utils.createRoute(geom[x]);
}

// create the remaining
let lines = new Feature({
  geometry: new LineString(coordinates),
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

var nameplateFeature = null;
var markerFeature = null;
document.getElementById("select").addEventListener("change", (e) => {
  var val = document.getElementById("select").value;
  let splits = val.split(' | ');
  let runner = runners.filter(r => r.NAME === splits[0]);

  if (runner.length > 0) {
    runner = runner[0];
    console.log(runner);
    if (markerFeature) {
      vectorSource.removeFeature(markerFeature);
      markerFeature = null;
    }
    if (nameplateFeature) {
      vectorSource.removeFeature(nameplateFeature);
      nameplateFeature = null;
    }

    let exptime = getExpTime(aid[runner.MARK].distance, runner.TIME);
    if (runner.MARK) markerFeature = utils.createFeature(aid[runner.MARK].latlog, styles.icon);
    nameplateFeature = utils.createFeature([77.785188, 12.883112], styles.rectangle(`${runner.NAME}\nBIB: ${runner.BIB}\nCrossed: ${aid[runner.MARK].distance} km\n ETA: ${exptime} HRS`));
  }
});

var getExpTime = (km, t) => {
  let sT = Date.parse(`Wed Oct 31 2021 4:30:00 GMT+0530 (India Standard Time)`);
  let cT = Date.parse(`Wed Oct 31 2021 ${t}:00 GMT+0530 (India Standard Time)`);
  let expT = ((cT-sT) / km) * 50;
  return (new Date(sT+expT)).toLocaleString().split(', ')[1];
}

var runners = [];
utils.gettiming().then(function (d) {
  runners = csvJSON(d);
  var datalist = document.getElementById("runners");
  runners.forEach(d => {
    // create the remaining
    datalist.innerHTML += `<option value="${d.NAME} | ${d.BIB}"></option>`;
  });
});

utils.createFeature([77.7048069, 12.9065275], styles.icon2);