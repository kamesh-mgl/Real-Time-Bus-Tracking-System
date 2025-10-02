import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { app } from './firebase-config.js'; // Your firebase-config.js should export 'app'

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const errorEl = document.getElementById('account-error');
  const logoutBtn = document.getElementById('logoutBtn');

  // Sidebar toggle for mobile
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mainContent = document.getElementById('mainContent');
  sidebarToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
  });
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('open');
        mainContent.classList.remove('sidebar-open');
      }
    });
  });
  document.addEventListener('click', function(event) {
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

  // Fetch and display user info
  onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed:", user);
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        console.log("Fetching user doc:", userDocRef.path);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data:", userData);
          usernameEl.textContent = userData.username || user.displayName || "No Name";
          emailEl.textContent = userData.email || user.email || "No Email";
        } else {
          usernameEl.textContent = user.displayName || "No Name";
          emailEl.textContent = user.email || "No Email";
        }
      } catch (err) {
        console.error("Error fetching user doc:", err);
        usernameEl.textContent = "Error";
        emailEl.textContent = "";
        errorEl.textContent = "Failed to load user data.";
        errorEl.classList.remove('d-none');
      }
    } else {
      // Not logged in, redirect to login
      window.location.href = "/html/login.html";
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async function() {
    try {
      await signOut(auth);
      window.location.href = "/html/login.html";
    } catch (err) {
      errorEl.textContent = "Logout failed.";
      errorEl.classList.remove('d-none');
      console.error("Logout error:", err);
    }
  });
});
