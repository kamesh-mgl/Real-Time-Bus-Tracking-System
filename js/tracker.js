console.log("JavaScript is running ✅");

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs
} from './firebase-config.js';

AOS.init();

const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const confirmFeedback = document.getElementById('confirmFeedback');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const username = document.getElementById('username');
const email = document.getElementById('email');

// Create inline feedback elements
const usernameFeedback = document.createElement('div');
usernameFeedback.className = "invalid-feedback";
usernameFeedback.textContent = "Username already exists.";
username.parentNode.appendChild(usernameFeedback);

const emailFeedback = document.createElement('div');
emailFeedback.className = "invalid-feedback";
emailFeedback.textContent = "Email already exists.";
email.parentNode.appendChild(emailFeedback);

// Toggle password visibility
togglePassword.addEventListener('click', () => {
  password.type = password.type === 'password' ? 'text' : 'password';
  togglePassword.querySelector('i').classList.toggle('fa-eye');
  togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
});
toggleConfirmPassword.addEventListener('click', () => {
  confirmPassword.type = confirmPassword.type === 'password' ? 'text' : 'password';
  toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye');
  toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye-slash');
});

// Live password match validation
confirmPassword.addEventListener('input', () => {
  if (confirmPassword.value !== password.value) {
    confirmPassword.classList.add('is-invalid');
    confirmFeedback.textContent = "Passwords do not match.";
  } else {
    confirmPassword.classList.remove('is-invalid');
    confirmFeedback.textContent = "";
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Reset validation states
  [username, email, password, confirmPassword].forEach(input => input.classList.remove('is-invalid'));
  usernameFeedback.style.display = 'none';
  emailFeedback.style.display = 'none';

  // Basic client-side validation
  let valid = true;
  if (!username.value.trim()) {
    username.classList.add('is-invalid');
    valid = false;
  }
  if (!email.value.trim() || !email.checkValidity()) {
    email.classList.add('is-invalid');
    valid = false;
  }
  if (password.value.length < 6) {
    password.classList.add('is-invalid');
    valid = false;
  }
  if (password.value !== confirmPassword.value) {
    confirmPassword.classList.add('is-invalid');
    confirmFeedback.textContent = "Passwords do not match.";
    valid = false;
  } else {
    confirmFeedback.textContent = "";
  }
  if (!valid) return;

  // Show spinner & disable button
  btnText.classList.add('d-none');
  btnSpinner.classList.remove('d-none');
  signupBtn.disabled = true;

  try {
    console.log("Checking if username exists...");
    const usernameQuery = query(collection(db, "officials"), where("username", "==", username.value.trim()));
    const usernameSnapshot = await getDocs(usernameQuery);
    if (!usernameSnapshot.empty) {
      username.classList.add('is-invalid');
      usernameFeedback.style.display = 'block';
      throw new Error("Username already exists.");
    }

    console.log("Creating user with email and password...");
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
      console.log("User created with UID:", userCredential.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        email.classList.add('is-invalid');
        emailFeedback.style.display = 'block';
        throw new Error("Email already exists.");
      } else {
        throw error;
      }
    }

    // Wait for auth state to update to ensure user is signed in
    await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          unsubscribe();
          resolve();
        }
      }, reject);
    });

    const user = auth.currentUser;
    console.log("Current user after signup:", user?.uid);

    if (!user) throw new Error("User authentication failed.");

    console.log("Saving user profile in Firestore...");
    await setDoc(doc(db, "officials", user.uid), {
      username: username.value.trim(),
      email: email.value.trim(),
      createdAt: new Date()
    });

    showToast('Signup successful! Redirecting to login...', 'success');
    setTimeout(() => {
      window.location.href = '/html/tracker-login.html';
    }, 1000);

  } catch (error) {
    console.error("Signup error:", error);
    if (error.message !== "Username already exists." && error.message !== "Email already exists.") {
      showToast('Error: ' + error.message, 'danger');
    }
  } finally {
    btnText.classList.remove('d-none');
    btnSpinner.classList.add('d-none');
    signupBtn.disabled = false;
  }
});

// Toast helper function
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

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
