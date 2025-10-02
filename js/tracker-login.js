import {
  auth,
  signInWithEmailAndPassword
} from './firebase-config.js';

AOS.init();

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const email = document.getElementById('email');
const password = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const emailFeedback = document.getElementById('emailFeedback');
const passwordFeedback = document.getElementById('passwordFeedback');

// Toggle password visibility
togglePassword.addEventListener('click', () => {
  password.type = password.type === 'password' ? 'text' : 'password';
  togglePassword.querySelector('i').classList.toggle('fa-eye');
  togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Reset validation states
  email.classList.remove('is-invalid');
  password.classList.remove('is-invalid');
  emailFeedback.textContent = "Please enter a valid email.";
  passwordFeedback.textContent = "Please enter your password.";

  let valid = true;

  if (!email.value.trim() || !email.checkValidity()) {
    email.classList.add('is-invalid');
    valid = false;
  }
  if (!password.value.trim()) {
    password.classList.add('is-invalid');
    valid = false;
  }

  if (!valid) return;

  // Show spinner & disable button
  btnText.classList.add('d-none');
  btnSpinner.classList.remove('d-none');
  loginBtn.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);

    // Success toast
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-success border-0 position-fixed top-0 end-0 m-3';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          Login successful! Redirecting...
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    document.body.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 1000 });
    toast.show();

    // Fast redirect to dashboard
    setTimeout(() => {
      window.location.href = '/html/tracker-dashboard.html';
    }, 1000);

  } catch (error) {
    // Show inline error
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      password.classList.add('is-invalid');
      passwordFeedback.textContent = "Invalid email or password.";
    } else if (error.code === 'auth/invalid-email') {
      email.classList.add('is-invalid');
      emailFeedback.textContent = "Invalid email address.";
    } else {
      password.classList.add('is-invalid');
      passwordFeedback.textContent = "Login failed. Please try again.";
    }
  } finally {
    btnText.classList.remove('d-none');
    btnSpinner.classList.add('d-none');
    loginBtn.disabled = false;
  }
});
