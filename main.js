// Zentrum Karte Objekt
let noeMitte = {
    lat: 48.27032985615784,
    lng: 15.764989268344962,
    title: "Max-Schubert-Warte, Niederösterreich"
};

// Karte initialisieren und Fullscreen Control 
let map = L.map("map", {
    fullscreenControl: true
}).setView([
    noeMitte.lat, noeMitte.lng
], 8.5);

// thematische Layer
let themaLayer = {
    kampThayaMarch: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/11709,kamp-thaya-march-radroute/
    piestingtal: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/17716,piestingtal-radweg/
    thayarunde: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/84734,thayarunde-waldviertel/
    traisental: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/17634,traisental-radweg/
    triestingGoelsental: L.featureGroup(),//https://www.bergfex.at/sommer/niederoesterreich/touren/fernradweg/11703,triesting-goelsental-radweg/
    triestingau: L.featureGroup(),//https://www.outdooractive.com/r/1366729
    ybbstal: L.featureGroup(),//https://www.outdooractive.com/r/10654578
    forecast: L.featureGroup(),
    badeseen: L.featureGroup()
};

// Hintergrundlayer 
let layerControl = L.control.layers({
    "BasemapÖsterreich": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "StamenB/W": L.tileLayer.provider("Stamen.TonerLite"),
    "CycleTrails": L.tileLayer.provider("CyclOSM"),
}, {
    "Kamp-Thaya-March-Radweg": themaLayer.kampThayaMarch.addTo(map),
    "Piestingtal-Radweg": themaLayer.piestingtal.addTo(map),
    "Thayarunde": themaLayer.thayarunde.addTo(map),
    "Traisental-Radweg": themaLayer.traisental.addTo(map),
    "Triesting-Gölsental-Radweg": themaLayer.triestingGoelsental.addTo(map),
    "Triestingau-Radweg": themaLayer.triestingau.addTo(map),
    "Ybbstal-Radweg": themaLayer.ybbstal.addTo(map),
    "Wettervorhersage MET Norway": themaLayer.forecast,
    "Badeseen": themaLayer.badeseen
}).addTo(map);

// Layer beim Besuch auf der Seite ausklappen
layerControl.expand();

// Instanz Leaflet MiniMap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
    toggleDisplay: true,
}
).addTo(map);

//Geolocation
map.locate({
    setView: false,
    maxZoom: 16,
    watch: true,
});

let circle = L.circle([0, 0], 0).addTo(map);

map.on('locationfound', function (evt) {
    let radius = Math.round(evt.accuracy);
    L.circle(evt.latlng, radius).addTo(map);
    circle.setLatLng(evt.latlng);
    circle.setRadius(radius);
}
);

let errorDisplayed = false;

map.on('locationerror', function (evt) {
    if (!errorDisplayed) {
        alert(evt.message);
        errorDisplayed = true;
    }
});

// Wettervorhersage MET Norway
async function showForecast(url, latlng) {
    let response = await fetch(url);
    let jsondata = await response.json();

    let current = jsondata.properties.timeseries[0].data.instant.details;

    let timestamp = new Date(jsondata.properties.meta.updated_at).toLocaleString();

    let timeseries = jsondata.properties.timeseries;

    let markup = `
        <h4>Wetter für ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (${timestamp})</h4>
        <table>
            <tr><td>Lufttemperatur (C)</td><td>${current.air_temperature}</td></tr>
            <tr><td>Bewölkungsgrad (%)</td><td>${current.cloud_area_fraction}</td></tr>
            <tr><td>Luftfeuchtigkeit (%)</td><td>${current.relative_humidity}</td></tr>
            <tr><td>Windrichtung (°)</td><td>${current.wind_from_direction}</td></tr>
            <tr><td>Windgeschwindigkeit (m/s)</td><td>${current.wind_speed}</td></tr>
        </table>
    `;

    // Wettersymbole hinzufügen
    for (let i = 0; i <= 24; i += 3) {
        let icon = timeseries[i].data.next_1_hours.summary.symbol_code;
        let img = `icons/${icon}.svg`;
        markup += `<img src="${img}" style="width:32px;" title="${timeseries[i].time.toLocaleString()}">`
    }
    L.popup().setLatLng(latlng).setContent(markup).openOn(themaLayer.forecast);
}

// Wettervorhersage auf Kartenklick reagieren (Event via map.on)
map.on("click", function (evt) {
    console.log(evt);
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}`;
    showForecast(url, evt.latlng);
});

//GPX-Tracks
//Kamp-Thaya-March
var gpx = './data/niederoesterreich/kamp_thaya_march.gpx';
let kamp = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFD700',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.kampThayaMarch);


// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
kamp.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/kamp_thaya_march.gpx")
});


//Piestingtal
var gpx = './data/niederoesterreich/piestingtal.gpx';
let piesting = new L.GPX(gpx, {
    polyline_options: {
        color: '#EEEE00',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.piestingtal);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
piesting.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/piestingtal.gpx")
});

//Thayarunde
var gpx = './data/niederoesterreich/thayarunde.gpx';
let thaya = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFEBCD',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.thayarunde);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
thaya.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/thayarunde.gpx")
});

//Traisentalweg
var gpx = './data/niederoesterreich/traisentalweg.gpx';
let traisen = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFFACD',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.traisental);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
traisen.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/traisentalweg.gpx")
});

//Triesting Gölsental
var gpx = './data/niederoesterreich/triesting_goelsental.gpx';
let triesting = new L.GPX(gpx, {
    polyline_options: {
        color: '#FFB90F',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.triestingGoelsental);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
triesting.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/triesting_goelsental.gpx")
});

//Triestingau
var gpx = './data/niederoesterreich/triestingau.gpx';
let triestingau = new L.GPX(gpx, {
    polyline_options: {
        color: '#B8860B',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.triestingau);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
triestingau.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "triestingau"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/triestingau.gpx")
});

//Ybbstalweg
var gpx = './data/niederoesterreich/ybbstalradweg.gpx';
let ybbs = new L.GPX(gpx, {
    polyline_options: {
        color: '#EEDD82',
        opacity: 0.75,
        weight: 3
    },
    marker_options: {
        startIconUrl: "icons/tab_cycle.png",
        endIconUrl: false,
        shadowUrl: false,
        wptIconUrls: false
    }
}).addTo(themaLayer.ybbstal);
// GPX Track visualisieren aus https://raruto.github.io/leaflet-elevation/
ybbs.on("click", function (evt) {
    let controlElevation = L.control.elevation({
        time: false,
        elevationDiv: "#profile",
        height: 300,
        theme: "kamp-thaya"
    }).addTo(map);
    // Load track from url (allowed data types: "*.geojson", "*.gpx", "*.tcx")
    controlElevation.load("./data/niederoesterreich/ybbstalradweg.gpx")
});

// Marker der größten Städte
const STAEDTE = [
    {
        title: "St. Pölten, Niederösterreich",
        lat: 48.18735,
        lng: 15.64139,
        wikipedia: "https://de.wikipedia.org/wiki/St._P%C3%B6lten"
    },
    {
        title: "Tulln",
        lat: 48.33001133291213,
        lng: 16.060959034595086,
        wikipedia: "https://de.wikipedia.org/wiki/Tulln_an_der_Donau"
    },
    {
        title: "Krems a.d. Donau",
        lat: 48.41022698533108,
        lng: 15.60382006192799,
        wikipedia: "https://de.wikipedia.org/wiki/Krems_an_der_Donau"
    },
    {
        title: "Baden bei Wien",
        lat: 48.0024595018188,
        lng: 16.230795040395048,
        wikipedia: "https://de.wikipedia.org/wiki/Baden_(Nieder%C3%B6sterreich)"
    },
]

for (let stadt of STAEDTE) {
    L.marker([stadt.lat, stadt.lng])
        .addTo(map)
        .bindPopup(`<b>${stadt.title}</b> <br>
        <a href="${stadt.wikipedia}">Wikipedia</a>
    `)
};

//Badeseen
const BADESEEN = [
    {
        title: "Ottensteiner Stausee",
        lat: 48.61799121352252,
        lng: 15.267483226467856,
    },
    {
        title: "Bernhardsthaler Teich",
        lat: 48.692857068868165,
        lng: 16.88281412284728
    },
    {
        title: "Naturbadeseen Traismauer",
        lat: 48.3654889628816,
        lng: 15.753145918954235
    },
    {
        title: "Badeteich Kalte Kuchl",
        lat: 47.888507360144025,
        lng: 15.68338462871469
    },
    {
        title: "Badeteich Persenbeug-Gottsdorf",
        lat: 48.18540724140658,
        lng: 15.103914278527622
    }
];

for (let badeseen of BADESEEN) {
    L.marker([badeseen.lat, badeseen.lng], {
        icon: L.icon({
            iconUrl: `icons/swimming.png`,
            popupAnchor: [0, -37],
            iconAnchor: [16, 37],
        })
    })
        .addTo(themaLayer.badeseen)
        .bindPopup(`<b>${badeseen.title}</b> <br>
    `)
};


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);