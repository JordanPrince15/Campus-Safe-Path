// let map, directionsService, directionsRenderer;

// const unsafeStreets = ["Prince Alfred St", "African St"]; // Example unsafe streets
// const streetlights = [
//   { lat: -33.310, lng: 26.521, working: true },
//   { lat: -33.312, lng: 26.523, working: false },
//   { lat: -33.313, lng: 26.519, working: true }
// ];

// function initMap() {
//   // Initialize map centered on Rhodes University
//   map = new google.maps.Map(document.getElementById("result"), {
//     zoom: 15,
//     center: { lat: -33.311, lng: 26.520 }
//   });

//   directionsService = new google.maps.DirectionsService();
//   directionsRenderer = new google.maps.DirectionsRenderer({
//     map: map,
//     polylineOptions: {
//       strokeColor: "#0b3d91",   // Darker blue
//       strokeWeight: 5,
//       strokeOpacity: 0.9
//     }
//   });

//   // Add glowing streetlights instead of markers
//   streetlights.forEach(light => {
//     addStreetLamp(map, new google.maps.LatLng(light.lat, light.lng), light.working);
//   });
// }

// // Function to create glowing streetlamp overlays
// function addStreetLamp(map, position, working) {
//   const overlay = new google.maps.OverlayView();

//   overlay.onAdd = function () {
//     const div = document.createElement("div");
//     div.className = working ? "streetlamp working" : "streetlamp broken";
//     this.div = div;

//     const panes = this.getPanes();
//     panes.overlayMouseTarget.appendChild(div);
//   };

//   overlay.draw = function () {
//     const overlayProjection = this.getProjection();
//     const pos = overlayProjection.fromLatLngToDivPixel(position);

//     if (this.div) {
//       this.div.style.left = pos.x + "px";
//       this.div.style.top = pos.y + "px";
//       this.div.style.position = "absolute";
//       this.div.style.transform = "translate(-50%, -50%)";
//     }
//   };

//   overlay.onRemove = function () {
//     if (this.div) {
//       this.div.parentNode.removeChild(this.div);
//       this.div = null;
//     }
//   };

//   overlay.setMap(map);
// }

// document.getElementById("toggleSidebar").addEventListener("click", () => {
//   document.getElementById("sidebar").classList.toggle("collapsed");
// });

// // Handle form submission
// document.getElementById("routeForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const from = document.getElementById("from").value;
//   const to = document.getElementById("to").value;

//   // Clear previous route
//   directionsRenderer.setDirections({ routes: [] });

//   // Calculate safest walking route
//   directionsService.route(
//     {
//       origin: from,
//       destination: to,
//       travelMode: google.maps.TravelMode.WALKING,
//       provideRouteAlternatives: true
//     },
//     (result, status) => {
//       if (status === "OK") {
//         let safeRoute = null;

//         result.routes.forEach(route => {
//           let isUnsafe = false;

//           route.legs[0].steps.forEach(step => {
//             unsafeStreets.forEach(street => {
//               if (step.instructions.includes(street)) {
//                 isUnsafe = true;
//               }
//             });
//           });

//           if (!isUnsafe && !safeRoute) {
//             safeRoute = route;
//           }
//         });

//         if (safeRoute) {
//           directionsRenderer.setDirections({ routes: [safeRoute] });
//           alert("✅ Safest route found!");
//         } else {
//           directionsRenderer.setDirections(result);
//           alert("⚠️ No fully safe route, showing best available.");
//         }
//       } else {
//         alert("Error calculating route: " + status);
//       }
//     }
//   );
// });

let map, directionsService, directionsRenderer;
const unsafeStreets = ["Prince Alfred St", "African St"]; // Example unsafe streets
const streetlights = [
  { lat: -33.310, lng: 26.521, working: true },
  { lat: -33.312, lng: 26.523, working: false },
  { lat: -33.313, lng: 26.519, working: true }
];

// Mapping of known campus locations for fuzzy matching / suggestions
const campusLocations = {
  "eden grove": { lat: -33.3081, lng: 26.5060 },
  "founders hall": { lat: -33.3075, lng: 26.5055 },
  "library": { lat: -33.3078, lng: 26.5048 }
};

// Initialize Google Map and Autocomplete
function initMap() {
  map = new google.maps.Map(document.getElementById("result"), {
    zoom: 16,
    center: { lat: -33.311, lng: 26.520 }
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    polylineOptions: {
      strokeColor: "#0b3d91",
      strokeWeight: 5,
      strokeOpacity: 0.9
    }
  });

  // Add streetlights
  streetlights.forEach(light => {
    addStreetLamp(map, new google.maps.LatLng(light.lat, light.lng), light.working);
  });

  // Initialize Google Places Autocomplete
  const fromInput = document.getElementById("from");
  const toInput = document.getElementById("to");
  new google.maps.places.Autocomplete(fromInput, { types: ['establishment', 'geocode'] });
  new google.maps.places.Autocomplete(toInput, { types: ['establishment', 'geocode'] });
}

// Streetlamp overlay
function addStreetLamp(map, position, working) {
  const overlay = new google.maps.OverlayView();
  overlay.onAdd = function () {
    const div = document.createElement("div");
    div.className = working ? "streetlamp working" : "streetlamp broken";
    this.div = div;
    const panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(div);
  };
  overlay.draw = function () {
    const overlayProjection = this.getProjection();
    const pos = overlayProjection.fromLatLngToDivPixel(position);
    if (this.div) {
      this.div.style.left = pos.x + "px";
      this.div.style.top = pos.y + "px";
      this.div.style.position = "absolute";
      this.div.style.transform = "translate(-50%, -50%)";
    }
  };
  overlay.onRemove = function () {
    if (this.div) this.div.parentNode.removeChild(this.div);
    this.div = null;
  };
  overlay.setMap(map);
}

// Sidebar toggle
document.getElementById("toggleSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("collapsed");
});

// Helper to validate input and suggest correction
function validateLocation(name) {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (campusLocations[key]) return campusLocations[key];

  // Suggest closest match
  const suggestions = Object.keys(campusLocations).filter(loc => loc.includes(key));
  return suggestions.length > 0 ? { suggestion: suggestions[0] } : null;
}

// Handle form submission
document.getElementById("routeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let from = document.getElementById("from").value;
  let to = document.getElementById("to").value;

  // i am temporarolly commenting this out
  // const fromValidation = validateLocation(from);
  // const toValidation = validateLocation(to);

  // // Check "from" input
  // if (!fromValidation) {
  //   alert(`❌ Unknown starting location: "${from}". Did you mean: ${Object.keys(campusLocations).join(", ")}?`);
  //   return;
  // } else if (fromValidation.suggestion) {
  //   alert(`⚠️ Starting location not exact. Did you mean: "${fromValidation.suggestion}"?`);
  //   from = fromValidation.suggestion;
  // }

  // // Check "to" input
  // if (!toValidation) {
  //   alert(`❌ Unknown destination: "${to}". Did you mean: ${Object.keys(campusLocations).join(", ")}?`);
  //   return;
  // } else if (toValidation.suggestion) {
  //   alert(`⚠️ Destination not exact. Did you mean: "${toValidation.suggestion}"?`);
  //   to = toValidation.suggestion;
  // }

  // Clear previous route
  directionsRenderer.setDirections({ routes: [] });

  // Calculate safest walking route
  directionsService.route(
    {
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode.WALKING,
      provideRouteAlternatives: true
    },
    (result, status) => {
      if (status === "OK") {
        let safeRoute = null;

        result.routes.forEach(route => {
          let isUnsafe = false;
          route.legs[0].steps.forEach(step => {
            unsafeStreets.forEach(street => {
              if (step.instructions.includes(street)) isUnsafe = true;
            });
          });
          if (!isUnsafe && !safeRoute) safeRoute = route;
        });

        if (safeRoute) {
          directionsRenderer.setDirections({ routes: [safeRoute] });
          alert("✅ Safest route found!");
        } else {
          directionsRenderer.setDirections(result);
          alert("⚠️ No fully safe route, showing best available.");
        }
      } else {
        alert("Error calculating route: " + status);
      }
    }
  );
});

// let map, directionsService, directionsRenderer, directLine;

// const unsafeStreets = ["Prince Alfred St", "African St"]; // Example unsafe streets
// const streetlights = [
//   { lat: -33.310, lng: 26.521, working: true },
//   { lat: -33.312, lng: 26.523, working: false },
//   { lat: -33.313, lng: 26.519, working: true }
// ];

// function initMap() {
//   // Initialize map centered on Rhodes University
//   map = new google.maps.Map(document.getElementById("result"), {
//     zoom: 15,
//     center: { lat: -33.311, lng: 26.520 }
//   });

//   directionsService = new google.maps.DirectionsService();
//   directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

//   // Draw streetlight markers
//   streetlights.forEach(light => {
//     new google.maps.Marker({
//       position: { lat: light.lat, lng: light.lng },
//       map: map,
//       icon: {
//         path: google.maps.SymbolPath.CIRCLE,
//         scale: 6,
//         fillColor: light.working ? "green" : "red",
//         fillOpacity: 1,
//         strokeWeight: 1
//       },
//       title: light.working ? "Working light" : "Broken light"
//     });
//   });
// }

// document.getElementById("routeForm").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const from = document.getElementById("from").value;
//   const to = document.getElementById("to").value;

//   // Clear previous routes and lines
//   directionsRenderer.setDirections({ routes: [] });
//   if (directLine) directLine.setMap(null);

//   // Draw straight line from start to end
//   const geocoder = new google.maps.Geocoder();
//   geocoder.geocode({ address: from }, (fromResults, status1) => {
//     if (status1 === "OK") {
//       const fromLocation = fromResults[0].geometry.location;

//       geocoder.geocode({ address: to }, (toResults, status2) => {
//         if (status2 === "OK") {
//           const toLocation = toResults[0].geometry.location;

//           directLine = new google.maps.Polyline({
//             path: [fromLocation, toLocation],
//             geodesic: true,
//             strokeColor: "#FF0000", // Red straight line
//             strokeOpacity: 0.8,
//             strokeWeight: 3,
//             map: map
//           });

//           // Adjust map to fit the line
//           const bounds = new google.maps.LatLngBounds();
//           bounds.extend(fromLocation);
//           bounds.extend(toLocation);
//           map.fitBounds(bounds);

//         } else {
//           alert("Could not find destination coordinates: " + status2);
//         }
//       });

//     } else {
//       alert("Could not find start coordinates: " + status1);
//     }
//   });

//   // Calculate safest walking route
//   directionsService.route(
//     {
//       origin: from,
//       destination: to,
//       travelMode: google.maps.TravelMode.WALKING,
//       provideRouteAlternatives: true
//     },
//     (result, status) => {
//       if (status === "OK") {
//         let safeRoute = null;

//         result.routes.forEach(route => {
//           let isUnsafe = false;

//           route.legs[0].steps.forEach(step => {
//             unsafeStreets.forEach(street => {
//               if (step.instructions.includes(street)) {
//                 isUnsafe = true;
//               }
//             });
//           });

//           if (!isUnsafe && !safeRoute) {
//             safeRoute = route;
//           }
//         });

//         if (safeRoute) {
//           directionsRenderer.setDirections({ routes: [safeRoute] });
//           alert("✅ Safest route found!");
//         } else {
//           directionsRenderer.setDirections(result);
//           alert("⚠️ No fully safe route, showing best available.");
//         }
//       } else {
//         alert("Error calculating route: " + status);
//       }
//     }
//   );
// });
