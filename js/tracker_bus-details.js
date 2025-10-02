import {
  auth,
  db,
  collection,
  getDocs,
  doc,
  setDoc
} from './firebase-config.js';

AOS.init();

const busList = document.getElementById('busList');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

let busesData = []; // Cache all buses

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'tracker-login.html';
    return;
  }
  await loadAllBuses();
});

async function loadAllBuses() {
  try {
    const busesCol = collection(db, 'buses');
    const busesSnapshot = await getDocs(busesCol);
    busesData = [];
    busesSnapshot.forEach(doc => {
      busesData.push({ id: doc.id, ...doc.data() });
    });
    renderBusList(busesData);
  } catch (error) {
    showToast('Failed to load buses: ' + error.message, 'danger');
  }
}

function renderBusList(buses) {
  busList.innerHTML = '';
  if (buses.length === 0) {
    busList.innerHTML = `<p class="text-center text-muted">No buses found.</p>`;
    return;
  }
  buses.forEach(bus => {
    const card = createBusCard(bus);
    busList.appendChild(card);
  });
}

function createBusCard(bus) {
  const card = document.createElement('div');
  card.className = 'bus-card animate__animated animate__fadeIn';

  // Header with Bus ID and Edit button
  const header = document.createElement('div');
  header.className = 'bus-card-header';

  const title = document.createElement('h5');
  title.textContent = `Bus ID: ${bus.id}`;
  header.appendChild(title);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-link p-0';
  editBtn.setAttribute('aria-label', `Edit bus ${bus.id}`);
  editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit';
  header.appendChild(editBtn);

  card.appendChild(header);

  // Details container
  const details = document.createElement('div');
  details.className = 'bus-details';

  // Route
  const routeLabel = document.createElement('label');
  routeLabel.textContent = 'Route';
  details.appendChild(routeLabel);

  const routeContainer = document.createElement('div');
  routeContainer.className = 'd-flex gap-2 mb-3';

  const sourceInput = document.createElement('input');
  sourceInput.type = 'text';
  sourceInput.value = bus.source || '';
  sourceInput.disabled = true;
  sourceInput.className = 'form-control';
  sourceInput.placeholder = 'Source';

  const destInput = document.createElement('input');
  destInput.type = 'text';
  destInput.value = bus.destination || '';
  destInput.disabled = true;
  destInput.className = 'form-control';
  destInput.placeholder = 'Destination';

  routeContainer.appendChild(sourceInput);
  routeContainer.appendChild(destInput);
  details.appendChild(routeContainer);

  // Towns Between
  const townsLabel = document.createElement('label');
  townsLabel.textContent = 'Towns Between';
  details.appendChild(townsLabel);

  const townsInput = document.createElement('textarea');
  townsInput.className = 'form-control mb-3';
  townsInput.rows = 2;
  townsInput.placeholder = 'Enter towns separated by commas';
  townsInput.value = (bus.towns && Array.isArray(bus.towns)) ? bus.towns.join(', ') : '';
  townsInput.disabled = true;
  details.appendChild(townsInput);

  // Timing
  const timingLabel = document.createElement('label');
  timingLabel.textContent = 'Timing';
  details.appendChild(timingLabel);

  const timingContainer = document.createElement('div');
  timingContainer.className = 'd-flex gap-2';

  const startInput = document.createElement('input');
  startInput.type = 'time';
  startInput.value = bus.startTime || '';
  startInput.disabled = true;
  startInput.className = 'form-control';

  const endInput = document.createElement('input');
  endInput.type = 'time';
  endInput.value = bus.endTime || '';
  endInput.disabled = true;
  endInput.className = 'form-control';

  timingContainer.appendChild(startInput);
  timingContainer.appendChild(endInput);
  details.appendChild(timingContainer);

  card.appendChild(details);

  // Footer with Save button (hidden initially)
  const footer = document.createElement('div');
  footer.className = 'bus-card-footer mt-3 text-end';
  footer.style.display = 'none';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = 'Save';
  footer.appendChild(saveBtn);
  card.appendChild(footer);

  // Edit button click handler
  editBtn.addEventListener('click', () => {
    const isEditing = !sourceInput.disabled;

    if (!isEditing) {
      // Enable inputs except bus id (bus id is not editable)
      sourceInput.disabled = false;
      destInput.disabled = false;
      townsInput.disabled = false;
      startInput.disabled = false;
      endInput.disabled = false;
      footer.style.display = 'block';
      editBtn.textContent = 'Cancel';
      editBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel';
    } else {
      // Cancel editing, revert values
      sourceInput.value = bus.source || '';
      destInput.value = bus.destination || '';
      townsInput.value = (bus.towns && Array.isArray(bus.towns)) ? bus.towns.join(', ') : '';
      startInput.value = bus.startTime || '';
      endInput.value = bus.endTime || '';
      sourceInput.disabled = true;
      destInput.disabled = true;
      townsInput.disabled = true;
      startInput.disabled = true;
      endInput.disabled = true;
      footer.style.display = 'none';
      editBtn.textContent = 'Edit';
      editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit';
    }
  });

  // Save button click handler
  saveBtn.addEventListener('click', async () => {
    // Basic validation
    if (!sourceInput.value.trim() || !destInput.value.trim() || !startInput.value || !endInput.value) {
      showToast('Please fill all fields before saving.', 'warning');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const busDocRef = doc(db, 'buses', bus.id);
      // Prepare towns array by splitting and trimming
      const townsArray = townsInput.value
        .split(',')
        .map(town => town.trim())
        .filter(town => town.length > 0);

      await setDoc(busDocRef, {
        source: sourceInput.value.trim(),
        destination: destInput.value.trim(),
        route: `${sourceInput.value.trim()} → ${destInput.value.trim()}`,
        towns: townsArray,
        startTime: startInput.value,
        endTime: endInput.value,
        timing: `${startInput.value} - ${endInput.value}`
      }, { merge: true });

      // Update local cache
      bus.source = sourceInput.value.trim();
      bus.destination = destInput.value.trim();
      bus.route = `${bus.source} → ${bus.destination}`;
      bus.towns = townsArray;
      bus.startTime = startInput.value;
      bus.endTime = endInput.value;
      bus.timing = `${bus.startTime} - ${bus.endTime}`;

      showToast('Bus data updated successfully.', 'success');

      // Disable inputs again
      sourceInput.disabled = true;
      destInput.disabled = true;
      townsInput.disabled = true;
      startInput.disabled = true;
      endInput.disabled = true;
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
      footer.style.display = 'none';

      // Reset edit button text
      editBtn.textContent = 'Edit';
      editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit';

    } catch (error) {
      showToast('Failed to update bus data: ' + error.message, 'danger');
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
    }
  });

  return card;
}

// Search form handler
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (!searchTerm) {
    renderBusList(busesData);
    return;
  }
  // Case-insensitive search for bus ID
  const filtered = busesData.filter(bus => bus.id.toLowerCase() === searchTerm);
  if (filtered.length === 0) {
    busList.innerHTML = `<p class="text-center text-muted">No bus found with ID "${searchInput.value.trim()}".</p>`;
  } else {
    renderBusList(filtered);
  }
});

// Toast helper function
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer') || createToastContainer();
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  document.body.appendChild(container);
  return container;
}
