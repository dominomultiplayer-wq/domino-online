// 1) Crea un proyecto en https://console.firebase.google.com/
// 2) Añade una aplicación web y copia aquí la configuración.
// 3) Activa Authentication > Sign-in method > Anonymous.
// 4) Crea Realtime Database y elige la ubicación más cercana.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "TU-PROYECTO.firebaseapp.com",
  databaseURL: "https://TU-PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU-PROYECTO",
  storageBucket: "TU-PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const configured = !Object.values(firebaseConfig).some(v =>
  String(v).includes("PEGA_AQUI") || String(v).startsWith("TU-") || String(v).includes("TU_")
);

let app, auth, db;
if (configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
}

export { auth, db, configured, signInAnonymously, onAuthStateChanged };
