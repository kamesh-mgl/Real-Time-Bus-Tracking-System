import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";



const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mainContent = document.getElementById('mainContent');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
  });

  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open');
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (
      window.innerWidth < 992 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(event.target) &&
      event.target !== sidebarToggle &&
      !sidebarToggle.contains(event.target)
    ) {
      sidebar.classList.remove('open');
      mainContent.classList.remove('sidebar-open');
    }
  });
});

// Initialize AOS animation
document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) AOS.init({ duration: 900, once: false });
});

const busIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f68c.svg',
  iconSize: [48, 48],
  iconAnchor: [24, 44],
  popupAnchor: [0, -36]
});

// --- CHANGE THESE FOR EACH BUS PAGE ---
const start = [78.1625010196804, 12.134191937038155]; // [lng, lat] for Bus 1
const end = [78.1393366563122, 11.669094776753314];   // [lng, lat] for Bus 1
const firebaseBusPath = "Bus101/LiveData"; // Firebase path for Bus 1
// -------------------------------------

// Initialize map centered roughly
const map = L.map('map').setView([11.9, 78.15], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const busMarker = L.marker([0, 0], { icon: busIcon }).addTo(map);

// --- Dynamic Routing Logic STARTS HERE ---
let currentRouteLine = null; // To store the current route polyline
const ORS_API_KEY = "5b3ce3597851110001cf62487d17c710fe35427b9013d6af24f0a447";
let initialRouteDrawn = false;

function updateRoute(startCoords, endCoords) {
  fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`)
    .then(response => {
      if (!response.ok) throw new Error("Routing API error " + response.status);
      return response.json();
    })
    .then(data => {
      const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);

      // Remove old route if exists
      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      // Draw new route
      currentRouteLine = L.polyline(coords, { color: 'blue', weight: 6, smoothFactor: 1.5 }).addTo(map);

      // Fit bounds only once on initial draw
      if (!initialRouteDrawn) {
        map.fitBounds(currentRouteLine.getBounds());
        initialRouteDrawn = true;
      }

      // Optionally update bus marker position to start of route
      busMarker.setLatLng(coords[0]);
    })
    .catch(err => {
      console.error("Failed to load route:", err);
    });
}

// Initial route draw (from static start to end)
updateRoute(start, end);

// Firebase live GPS data listener
const gpsRef = ref(database, firebaseBusPath);
onChildAdded(gpsRef, (snapshot) => {
  const data = snapshot.val();
  if (data && data.latitude && data.longitude) {
    const latlng = [data.latitude, data.longitude];

    // Update bus marker position
    busMarker.setLatLng(latlng);
    busMarker.bindPopup(`<b>Live Bus Location</b><br>Lat: ${latlng[0].toFixed(5)}<br>Lon: ${latlng[1].toFixed(5)}`).openPopup();

    // Pan map smoothly to bus location without zoom change
    map.panTo(latlng);

    // Update route dynamically WITHOUT fitting bounds again
    updateRoute([latlng[1], latlng[0]], end); // ORS expects [lng, lat]
  }
});
