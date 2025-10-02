import {
  auth,
  db,
  doc,
  setDoc,
  getDoc
} from './firebase-config.js';

AOS.init();

const usernameDisplay = document.getElementById('usernameDisplay');
const busForm = document.getElementById('busForm');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const submitBtnSpinner = document.getElementById('submitBtnSpinner');
const successTick = document.getElementById('successTick');
const toastContainer = document.getElementById('toastContainer');

const busIdInput = document.getElementById('busId');
const sourceInput = document.getElementById('source');
const destinationInput = document.getElementById('destination');
const townsInput = document.getElementById('towns');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');

// Show logged-in user's name
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'tracker-login.html';
    return;
  }
  const docSnap = await getDoc(doc(db, "officials", user.uid));
  if (docSnap.exists()) {
    usernameDisplay.textContent = docSnap.data().username || "User";
  }
});

busForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Reset validation states
  [busIdInput, sourceInput, destinationInput, startTimeInput, endTimeInput].forEach(input => input.classList.remove('is-invalid'));

  let valid = true;
  if (!busIdInput.value.trim()) {
    busIdInput.classList.add('is-invalid');
    valid = false;
  }
  if (!sourceInput.value.trim()) {
    sourceInput.classList.add('is-invalid');
    valid = false;
  }
  if (!destinationInput.value.trim()) {
    destinationInput.classList.add('is-invalid');
    valid = false;
  }
  if (!startTimeInput.value) {
    startTimeInput.classList.add('is-invalid');
    valid = false;
  }
  if (!endTimeInput.value) {
    endTimeInput.classList.add('is-invalid');
    valid = false;
  }
  if (!valid) return;

  // Show spinner & disable button
  submitBtnText.classList.add('d-none');
  submitBtnSpinner.classList.remove('d-none');
  submitBtn.disabled = true;
  successTick.style.display = 'none';

  try {
    const busDocRef = doc(db, "buses", busIdInput.value.trim());
    const busDocSnap = await getDoc(busDocRef);
    if (busDocSnap.exists()) {
      busIdInput.classList.add('is-invalid');
      showToast('Bus ID already exists. Please choose another.', 'danger');
      throw new Error('Bus ID exists');
    }

    // Prepare towns array by splitting and trimming
    const townsArray = townsInput.value
      .split(',')
      .map(town => town.trim())
      .filter(town => town.length > 0);

    await setDoc(busDocRef, {
      route: `${sourceInput.value.trim()} → ${destinationInput.value.trim()}`,
      source: sourceInput.value.trim(),
      destination: destinationInput.value.trim(),
      towns: townsArray,
      timing: `${startTimeInput.value} - ${endTimeInput.value}`,
      startTime: startTimeInput.value,
      endTime: endTimeInput.value
    });

    successTick.style.display = 'block';
    setTimeout(() => {
      busForm.reset();
      successTick.style.display = 'none';
    }, 1500);

    showToast('Bus data saved successfully!', 'success');
  } catch (error) {
    // Error handled above or show generic error
    if (error.message !== 'Bus ID exists') {
      showToast('Error: ' + error.message, 'danger');
    }
  } finally {
    submitBtnText.classList.remove('d-none');
    submitBtnSpinner.classList.add('d-none');
    submitBtn.disabled = false;
  }
});

function showToast(message, type = 'info') {
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
  const toast = new bootstrap.Toast(toastEl, { delay: 2000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}
// Hamburger menu toggle logic
document.addEventListener('DOMContentLoaded', function () {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      mobileMenu.classList.toggle('d-none');
    });

    // Hide the menu when clicking outside
    document.addEventListener('click', function (event) {
      if (
        !mobileMenu.classList.contains('d-none') &&
        !mobileMenu.contains(event.target) &&
        event.target !== hamburgerBtn &&
        !hamburgerBtn.contains(event.target)
      ) {
        mobileMenu.classList.add('d-none');
      }
    });

    // Optional: Hide menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('d-none');
      });
    });
  }
});
