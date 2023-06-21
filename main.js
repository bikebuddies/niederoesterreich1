// Zentrum Karte Objekt
let noeMitte = { 
    lat: 48.27032985615784,
    lng: 15.764989268344962,
    title: "Max-Schubert-Warte, Niederösterreich"
}

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
}

// Hintergrundlayer 
//noch den schöneren von der Hauptkarte einfügen, wenn wir das geschafft haben 
let eGrundkarteNiederoesterreich = L.control.layers({
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
}).addTo(map);

// Instanz Leaflet MiniMap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
    toggleDisplay: true,
    minimized: true
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

map.on('locationerror', function (evt) {
    alert(evt.message);
});


//GPX-Tracks

//Funktion implementieren für die GPX-Tracks
async function gpxTracks(gpx) {
    let routenFarben = {//Gelbtöne von https://www.farb-tabelle.de/de/farbtabelle.htm#yellow
        "Ybbstalradweg": "#EEDD82", //BlanchedAlmond 
        "Triestingau-Radweg": "#B8860B", //DarkGoldenrod
        "Triesting-Gölsental-Radweg": "#FFB90F", //DarkGoldenrod1
        "Traisentalweg": "#FFFACD", //LemonChiffon
        "Thayarunde Waldviertel": "#FFEBCD", //LightGo.denrod
        "Piestingtal-Radweg": "#EEEE00", //yellow2
        "Kamp-Thaya-March-Radroute": "#FFD700", //gold
    };
    let zuordnungLayer = {
        "Ybbstalradweg": "themaLayer.kampThayaMarch",
        "Piestingtal-Radweg": "themaLayer.piestingtal",
        "Thayarunde": "themaLayer.thayarunde",
        "Traisental-Radweg": "themaLayer.traisental",
        "Triesting-Gölsental-Radweg": "themaLayer.triestingGoelsental",
        "Triestingau-Radweg": "themaLayer.triestingau",
        "Ybbstal-Radweg": "themaLayer.ybbstal"
    };
    new L.GPX(gpx, {
        polyline_options: function (feature) {
            return {
                color: routenFarben[feature.properties.Name],//der Zugriff auf die Farben funktioniert noch nicht!
                opacity: 0.75,
                weight: 3
            };
        },
        marker_options: {
            startIconUrl: false,
            endIconUrl: false,
            shadowUrl: false,
            wptIconUrls: false
        },
    }).on('loaded', function (e) {
        //   map.fitBounds(e.target.getBounds());
    }).addTo(themaLayer);//hier noch den richtigen Themalayern zuordnen!
}

gpxTracks("data/niederoesterreich/kamp_thaya_march.gpx");
gpxTracks("data/niederoesterreich/piestingtal.gpx");
gpxTracks("data/niederoesterreich/thayarunde.gpx");
gpxTracks("data/niederoesterreich/traisentalweg.gpx");
gpxTracks("data/niederoesterreich/triesting_goelsental.gpx");
gpxTracks("data/niederoesterreich/triestinggau.gpx");
gpxTracks("data/niederoesterreich/ybbstalradweg.gpx");

//Farben und Themalayer zuordnen! Popups für die Tracks erstellen bei Klick (wie in start repo)

// var gpx = './data/niederoesterreich/kamp_thaya_march.gpx';
// new L.GPX(gpx, {
//         polyline_options: {
//             color: 'green',
//             opacity: 0.75,
//             weight: 3
//         },
//         marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     },
// }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.kampThayaMarch);

// var gpx = './data/niederoesterreich/piestingtal.gpx';
// new L.GPX(gpx, { async: true,
//     marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     }
//  }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.piestingtal);

// var gpx = './data/niederoesterreich/thayarunde.gpx';
// new L.GPX(gpx, { async: true,
//     marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     }
//  }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.thayarunde);

// var gpx = './data/niederoesterreich/traisentalweg.gpx';
// new L.GPX(gpx, { async: true,
//     marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     }
//  }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.traisental);

// var gpx = './data/niederoesterreich/triesting_goelsental.gpx';
// new L.GPX(gpx, { async: true,
//     marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     }
//  }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.triestingGoelsental);

// var gpx = './data/niederoesterreich/triestingau.gpx';
// new L.GPX(gpx, { async: true,
//     marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     }
//  }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.triestingau);

// var gpx = './data/niederoesterreich/ybbstalradweg.gpx';
// new L.GPX(gpx, {
//     async: true,
//     marker_options: {
//         startIconUrl: false,
//         endIconUrl: false,
//         shadowUrl: false,
//         wptIconUrls: false
//     }
// }).on('loaded', function (e) {
//     //   map.fitBounds(e.target.getBounds());
// }).addTo(themaLayer.ybbstal);


// Marker der größten Städte
const STAEDTE = [
    {
        title: "St. Pölten, Niederösterreich",
        lat: 48.18735,
        lng: 15.64139,
        wikipedia: "https://de.wikipedia.org/wiki/St._P%C3%B6lten"//Links raus oder anpassen?
    },
    {
        title: "Tulln",
        lat: 48.33001133291213,
        lng: 16.060959034595086,
        wikipedia: "https://de.wikipedia.org/wiki/Wien" //Links raus oder anpassen?
    },
    {
        title: "Krems a.d. Donau",
        lat: 48.41022698533108,
        lng: 15.60382006192799,
        wikipedia: "https://de.wikipedia.org/wiki/Eisenstadt"//Links raus oder anpassen?
    },
    {
        title: "Baden bei Wien",
        lat: 48.0024595018188,
        lng: 16.230795040395048,
        wikipedia: "https://de.wikipedia.org/wiki/Eisenstadt"//Links raus oder anpassen?
    },
]

for (let stadt of STAEDTE) {
    //Marker für den Stopp
    let marker = L.marker([stadt.lat, stadt.lng])
        .addTo(map)
        .bindPopup(`${stadt.title} <br>
    <a href="${stop.wikipedia}">Wikipedia</a>
    `)
};

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// //GPX-Track visualisieren -> Höhenprofile (es sind noch nicht alle)
// let controlElevation = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation.load("data/niederoesterreich/piestingtal.gpx");

// //GPX-Track visualisieren
// let controlElevation1 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation1.load("data/niederoesterreich/kamp_thaya_march.gpx")

// //GPX-Track visualisieren
// let controlElevation2 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation2.load("data/niederoesterreich/thayarunde.gpx")

// //GPX-Track visualisieren
// let controlElevation3 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation3.load("data/niederoesterreich/traisentalweg.gpx")

// //GPX-Track visualisieren
// let controlElevation4 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation4.load("triesting_goelsental.gpx")

// //GPX-Track visualisieren
// let controlElevation5 = L.control.elevation({
//     time: false,
//     elevationDiv: "#profile",
//     height: 300,
//     theme: "Radtouren Niederösterreich"
// }).addTo(themaLayer.route);
// controlElevation5.load("data/niederoesterreich/traisentalweg.gpx")

//Kommentare aus der start-Seite
/* Pulldownmenü Code
//Pulldown für Navigation
let pulldown = document.querySelector("#pulldown");
for (let etappe of ETAPPEN) {
    //console.log(etappe);
    let status = "";
    if (etappe.nr == "20") {
        status = "selected";
    }
    pulldown.innerHTML += `<option ${status} value="${etappe.user}">Etappe ${etappe.nr}: ${etappe.etappe}</option>`
}

// auf Änderungen im Pulldown reagieren
pulldown.onchange = function(evt) {
    //console.log(pulldown.value);
    let url = `https://${pulldown.value}.github.io/biketirol`;
    //console.log(url);
    window.location.href = url;
}
*/

/* Geolocation würd ich auf der Übersichtskarte weglassen, damit es wirklich nur eine Übersicht wird.
map.locate({
    setView: true,
    watch: true, 
    maxZoom: 16
});

let circle = L.circle([0, 0], 0).addTo(map);
let marker = L.marker([0, 0], 0).addTo(map);

map.on('locationfound', function onLocationFound(evt) {
    console.log(evt);
    let radius = Math.round(evt.accuracy);
    marker.setLatLng(evt.latlng);
    marker.bindTooltip(`You are within ${radius} meters from this point`).openTooltip();
    circle.setLatLng(evt.latlng);
    circle.setRadius(radius);
});

map.on('locationerror', function onLocationError(evt) {
    alert(evt.message);
});
*/