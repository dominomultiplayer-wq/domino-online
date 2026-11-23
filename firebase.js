
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "domino-online-361fb.firebaseapp.com",
  databaseURL: "AQUI_VA_LA_URL_DE_TU_BASE_DE_DATOS",
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
