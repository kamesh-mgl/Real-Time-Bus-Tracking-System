import { auth, db, collection, query, where, getDocs } from './firebase-config.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const forgotForm = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const emailFeedback = document.getElementById('emailFeedback');
const resetBtn = document.getElementById('resetBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const toastContainer = document.getElementById('toastContainer');

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  emailInput.classList.remove('is-invalid');
  emailFeedback.textContent = '';

  if (!emailInput.value.trim() || !emailInput.checkValidity()) {
    emailInput.classList.add('is-invalid');
    emailFeedback.textContent = 'Enter a valid email address.';
    return;
  }

  btnText.classList.add('d-none');
  btnSpinner.classList.remove('d-none');
  resetBtn.disabled = true;

  try {
    // Check if email exists in users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', emailInput.value.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      emailInput.classList.add('is-invalid');
      emailFeedback.textContent = 'No account found with this email.';
      throw new Error('No account found with this email.');
    }

    // Optionally, show the username to the user
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    showToast(`Username: ${userData.username}`, 'info');

    // Send password reset email
    await sendPasswordResetEmail(auth, emailInput.value.trim());
    showToast('Password reset link sent! Check your email.', 'success');
  } catch (error) {
    if (!emailFeedback.textContent) {
      showToast('Failed to send reset link: ' + error.message, 'danger');
    }
  } finally {
    btnText.classList.remove('d-none');
    btnSpinner.classList.add('d-none');
    resetBtn.disabled = false;
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
