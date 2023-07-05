let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
});

function style(feature) {
    return {
        fillOpacity: 1,
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "white",
        radius: markerSize(feature.properties.mag),
        stroke: true,
        weight: 0.6
    };
}

function markerColor(depth) {
    var colors = ["#fafa6e",
        "#9cdf7c",
        "#4abd8c",
        "#00968e",
        "#106e7c",
        "#2a4858"];
    if (depth<10) {
        return colors[0];
    } else if (depth >=10 && depth < 30) {
        return colors[1];
    } else if (depth >= 30 && depth < 50) {
        return colors[2];
    } else if (depth >=50 && depth < 70) {
        return colors[3];
    } else if (depth >=70 && depth < 90) {
        return colors [4];
    } else if (depth >=90) {
        return colors[5];
    }
}

function markerSize(mag) {
    if (mag === 0) {
        return .1;
    }

    return mag * 5;
}

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km`);
  }

  function pointToLayer(featur, latlng) {
    return L.circleMarker(latlng);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    style: style
  });

  createMap(earthquakes);
};

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      39.0522, -110.2437
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

var info = L.control({
    position: "bottomright"
});

info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    depth = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3 style='text-align: center'>Depth (km)</h3>"
  
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
      '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }

    return div;
};

info.addTo(myMap);

}