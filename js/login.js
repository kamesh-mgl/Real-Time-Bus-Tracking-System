import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
  signInWithEmailAndPassword
} from './firebase-config.js';

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameFeedback = document.getElementById('usernameFeedback');
const passwordFeedback = document.getElementById('passwordFeedback');
const toastContainer = document.getElementById('toastContainer');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Reset validation states
  [usernameInput, passwordInput].forEach(input => input.classList.remove('is-invalid'));
  usernameFeedback.textContent = '';
  passwordFeedback.textContent = '';

  if (!usernameInput.value.trim()) {
    usernameInput.classList.add('is-invalid');
    usernameFeedback.textContent = 'Username is required.';
    return;
  }
  if (!passwordInput.value) {
    passwordInput.classList.add('is-invalid');
    passwordFeedback.textContent = 'Password is required.';
    return;
  }

  btnText.classList.add('d-none');
  btnSpinner.classList.remove('d-none');
  loginBtn.disabled = true;

  try {
    // Find user document by username in 'users' collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', usernameInput.value.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      usernameInput.classList.add('is-invalid');
      usernameFeedback.textContent = 'Username not found.';
      throw new Error('Username not found');
    }

    // Get the first matched user doc (should be unique)
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const email = userData.email;

    // Sign in with email and password
    await signInWithEmailAndPassword(auth, email, passwordInput.value);

    // On success, redirect to dashboard or home page
    window.location.href = '/html/user-dashboard.html';

  } catch (error) {
    if (error.message !== 'Username not found') {
      passwordInput.classList.add('is-invalid');
      passwordFeedback.textContent = 'Incorrect password or error occurred.';
    }
    showToast('Login failed: ' + error.message, 'danger');
  } finally {
    btnText.classList.remove('d-none');
    btnSpinner.classList.add('d-none');
    loginBtn.disabled = false;
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
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}
