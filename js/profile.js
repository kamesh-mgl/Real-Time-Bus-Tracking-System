import { auth, db, doc, getDoc, signOut } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  AOS.init();

  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const logoutBtn = document.getElementById('logoutBtn');

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '/html/tracker-login.html';
      return;
    }
    try {
      const userDocRef = doc(db, 'officials', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        usernameInput.value = data.username || '';
        emailInput.value = data.email || user.email || '';
      } else {
        usernameInput.value = '';
        emailInput.value = user.email || '';
      }
    } catch (error) {
      alert('Failed to load profile data: ' + error.message);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = '/html/tracker-login.html';
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  });
});
