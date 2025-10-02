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

const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const confirmFeedback = document.getElementById('confirmFeedback');
const username = document.getElementById('username');
const email = document.getElementById('email');
const usernameFeedback = document.getElementById('usernameFeedback');
const emailFeedback = document.getElementById('emailFeedback');
const toastContainer = document.getElementById('toastContainer');

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

  // Trim inputs once
  const usernameVal = username.value.trim();
  const emailVal = email.value.trim();
  const passwordVal = password.value;
  const confirmPasswordVal = confirmPassword.value;

  // Reset validation states and feedback
  [username, email, password, confirmPassword].forEach(input => input.classList.remove('is-invalid'));
  usernameFeedback.textContent = '';
  emailFeedback.textContent = '';
  confirmFeedback.textContent = '';

  // Basic validation
  let valid = true;
  if (!usernameVal) {
    username.classList.add('is-invalid');
    usernameFeedback.textContent = "Username is required.";
    valid = false;
  }
  if (!emailVal || !email.checkValidity()) {
    email.classList.add('is-invalid');
    emailFeedback.textContent = "Valid email required.";
    valid = false;
  }
  if (passwordVal.length < 6) {
    password.classList.add('is-invalid');
    valid = false;
  }
  if (passwordVal !== confirmPasswordVal) {
    confirmPassword.classList.add('is-invalid');
    confirmFeedback.textContent = "Passwords do not match.";
    valid = false;
  }
  if (!document.getElementById('terms').checked) {
    showToast('You must agree to the Terms & Conditions.', 'danger');
    valid = false;
  }
  if (!valid) return;

  // Show spinner & disable button
  btnText.classList.add('d-none');
  btnSpinner.classList.remove('d-none');
  signupBtn.disabled = true;

  try {
    // Check username uniqueness
    const usernameQuery = query(collection(db, "users"), where("username", "==", usernameVal));
    const usernameSnap = await getDocs(usernameQuery);
    if (!usernameSnap.empty) {
      username.classList.add('is-invalid');
      usernameFeedback.textContent = "Username already exists.";
      showToast("Username already exists.", "danger");
      return;
    }

    // Create user with email and password (Firebase Auth enforces email uniqueness)
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, emailVal, passwordVal);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        email.classList.add('is-invalid');
        emailFeedback.textContent = "Email already exists.";
        showToast("Email already exists.", "danger");
        return;
      } else {
        throw error;
      }
    }

    const user = userCredential.user;
    console.log('User before Firestore write:', auth.currentUser);
    if (!auth.currentUser) {
    console.error('User not authenticated yet!');
    }

    // Save user profile in Firestore (under 'users')
    await setDoc(doc(db, "users", user.uid), {
      username: usernameVal,
      email: emailVal,
      createdAt: new Date()
      // Do NOT store password here!
    });

    showToast('Signup successful! Redirecting to login...', 'success');

    // Optionally clear form
    signupForm.reset();

    setTimeout(() => {
      window.location.href = '/html/login.html';
    }, 1200);

  } catch (error) {
    showToast('Error: ' + error.message, 'danger');
  } finally {
    btnText.classList.remove('d-none');
    btnSpinner.classList.add('d-none');
    signupBtn.disabled = false;
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
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}
