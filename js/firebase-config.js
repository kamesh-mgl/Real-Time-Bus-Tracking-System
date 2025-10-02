import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  limit,
  orderBy,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut // <-- ADD THIS LINE
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: 
  authDomain: 
  databaseURL: 
  projectId:
  storageBucket: 
  messagingSenderId:
  appId: 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

export {
  db,
  rtdb,
  auth,
  app,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  limit,
  orderBy,
  where,
  getDocs,
  ref,
  onValue,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut // <-- ADD THIS LINE TO EXPORTS TOO
};
