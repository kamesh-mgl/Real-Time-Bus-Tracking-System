// /js/bus-route.js
import {
  db,
  collection,
  getDocs,
} from './firebase-config.js'; // Adjust path if needed

// Sidebar toggle logic for hamburger menu and responsive behavior
document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mainContent = document.getElementById('mainContent');

  sidebarToggle?.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
  });

  // Close sidebar when clicking a nav link on small screens
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open');
      }
    });
  });

  // Close sidebar when clicking outside on small screens
  document.addEventListener('click', function (event) {
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

// Elements
const routeForm = document.getElementById('routeForm');
const firestoreBusDetailsSection = document.getElementById('firestoreBusDetailsSection');
const firestoreBusDetails = document.getElementById('firestoreBusDetails');

// Normalize strings for case-insensitive and trimmed comparison
function normalize(str) {
  return str.trim().toLowerCase();
}

// Fetch all buses from Firestore
async function getAllBuses() {
  const busesRef = collection(db, 'buses');
  const snapshot = await getDocs(busesRef);

  const buses = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    buses.push({
      id: docSnap.id,
      ...data,
      source: data.source || (data.towns && data.towns[0]) || 'N/A',
      destination: data.destination || (data.towns && data.towns[data.towns.length - 1]) || 'N/A'
    });
  });
  return buses;
}

// Filter buses by matching first and last town with source and destination
function filterBusesByRoute(buses, source, destination) {
  return buses.filter(bus => {
    if (!bus.towns || !Array.isArray(bus.towns) || bus.towns.length < 2) return false;
    const firstTown = normalize(bus.towns[0]);
    const lastTown = normalize(bus.towns[bus.towns.length - 1]);
    return firstTown === normalize(source) && lastTown === normalize(destination);
  });
}

// Render bus cards in the UI
function renderBuses(buses) {
  // Clear previous results area if any
  firestoreBusDetails.innerHTML = '';

  if (!buses || buses.length === 0) {
    firestoreBusDetailsSection.style.display = 'block';
    firestoreBusDetails.innerHTML = '<p class="text-muted">No buses found for the selected route.</p>';
    return;
  }

  let html = '<div class="row g-3">';
buses.forEach(bus => {
  // Construct URL for separate map page per bus, e.g., map_bus1.html, map_bus2.html, etc.
  // Assuming bus.id or bus.number is suitable for filenames (sanitize if needed)
  const busPage = `map_bus${bus.id || bus.number}.html`;
  const mapUrl = `/html/${busPage}`;

  html += `
    <div class="col-md-12 mb-3">
      <div class="bus-result-card glassy shadow-sm rounded-3 p-3 d-flex flex-column">
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-bus fa-2x text-primary me-3" aria-hidden="true"></i>
          <h5 class="mb-0 fw-bold">Bus ${bus.number || bus.id}</h5>
        </div>
        <p class="mb-1"><strong>Route:</strong> ${bus.towns ? bus.towns.join(' → ') : 'N/A'}</p>
        <p class="mb-1"><strong>Source:</strong> ${bus.source}</p>
        <p class="mb-1"><strong>Destination:</strong> ${bus.destination}</p>
        <p class="mb-1"><strong>Timing:</strong> ${bus.timing || (bus.startTime && bus.endTime ? `${bus.startTime} - ${bus.endTime}` : 'N/A')}</p>
        <a href="${mapUrl}" class="btn btn-outline-primary btn-sm rounded-pill mt-3 align-self-start" aria-label="View bus ${bus.number || bus.id} in map">View in Map</a>
      </div>
    </div>
  `;
});
html += '</div>';

  firestoreBusDetailsSection.style.display = 'block';
  firestoreBusDetails.innerHTML = html;
}

// Show all buses on page load
async function showAllBuses() {
  try {
    const allBuses = await getAllBuses();
    renderBuses(allBuses);
  } catch (error) {
    console.error('Error loading all buses:', error);
    firestoreBusDetailsSection.style.display = 'block';
    firestoreBusDetails.innerHTML = `<p class="text-danger">Error loading buses: ${error.message}</p>`;
  }
}

// Handle form submission - filter buses by source and destination
routeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const source = document.getElementById('source').value.trim();
  const destination = document.getElementById('destination').value.trim();

  if (!source || !destination) {
    alert('Please enter both source and destination.');
    return;
  }

  firestoreBusDetailsSection.style.display = 'none';
  firestoreBusDetails.innerHTML = '';

  try {
    const allBuses = await getAllBuses();
    const filteredBuses = filterBusesByRoute(allBuses, source, destination);
    renderBuses(filteredBuses);
  } catch (error) {
    console.error('Error filtering buses:', error);
    alert('An error occurred while fetching buses: ' + error.message);
  }
});

// On page load, show all buses
document.addEventListener('DOMContentLoaded', () => {
  showAllBuses();
});
