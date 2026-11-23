
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfUNGky2BE1gnMj2l3mFeV3AgQ3MP3Fxg",
  authDomain: "domino-online-361fb.firebaseapp.com",
  databaseURL: "https://domino-online-361fb-default-rtdb.firebaseio.com",
  projectId: "domino-online-361fb",
  storageBucket: "domino-online-361fb.firebasestorage.app",
  messagingSenderId: "934894497792",
  appId: "1:934894497792:web:2c65a0b2fa01ecb7aba8e5",
  measurementId: "G-LYCJ00QDMV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  googleProvider,
  signInWithRedirect,
  getRedirectResult
};
