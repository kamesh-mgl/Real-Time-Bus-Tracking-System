// Initialize map
var map = L.map('mapid').setView([12.9716, 77.5946], 12); // Example coordinates (Bangalore)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a marker for bus
var busMarker = L.marker([12.9716, 77.5946]).addTo(map); // Example coordinates

busMarker.bindPopup("<b>Bus Number 101</b><br>Current Location").openPopup();

// Function to update bus location (for live updates, you'd replace this with data from Firebase or a backend API)
function updateBusLocation(lat, lon) {
    busMarker.setLatLng([lat, lon]);
    map.setView([lat, lon], 12);
}

// Example: Update bus location after 5 seconds (simulated movement)
setTimeout(() => {
    updateBusLocation(12.9766, 77.6000); // New location after 5 seconds
}, 5000);
