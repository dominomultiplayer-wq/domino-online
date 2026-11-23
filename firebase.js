
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfUNGky2BE1gnMj2l3mFeV3AgQ3MP3Fxg",
  authDomain: "domino-online-361fb.firebaseapp.com",
  databaseURL: "https://domino-online-361fb-default-rtdb.firebaseio.com",
  projectId: "domino-online-361fb",
  storageBucket: "domino-online-361fb.firebasestorage.app",
  messagingSenderId: "934894497792",
  appId: "1:934894497792:web:2c65a0b2fa01ecb7aba8e5"
};

const configured = !firebaseConfig.apiKey.includes("TU_") &&
  !firebaseConfig.databaseURL.includes("AQUI_VA");

let app, auth, db;

if (configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
}

export {
  auth,
  db,
  configured,
  signInAnonymously,
  onAuthStateChanged
};
