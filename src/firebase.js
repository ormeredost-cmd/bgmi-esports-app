// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// (analytics ki jarurat nahi to hata sakta hai)

// Tera exact firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyCigI18xcAV5l72A92PC4fd_ycaJiXL3W0",
  authDomain: "bgmi-esports-panel.firebaseapp.com",
  projectId: "bgmi-esports-panel",
  // yahan ".app" nahi, ".appspot.com" hona chahiye
  storageBucket: "bgmi-esports-panel.appspot.com",
  messagingSenderId: "502293304562",
  appId: "1:502293304562:web:96ee481b7c63074f25ec6b",
  measurementId: "G-KBGVFJDD6L",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
