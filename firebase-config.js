// Firebase Initialization & Dual Storage Fallback System
// Works with Firebase Auth & Firestore, with automatic fallback to LocalStorage if Firebase is unconfigured.

// CDN Imports for Firebase v10 Modular SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Default / Stored Firebase Configuration
const STORAGE_KEY_CONFIG = 'craftvoca_firebase_config';

const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  // Check global environment window config
  if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
    return window.FIREBASE_CONFIG;
  }
  return null;
};

let app = null;
let auth = null;
let db = null;
let isFirebaseActive = false;

const initFirebaseSystem = () => {
  const config = getSavedFirebaseConfig();
  if (config && config.apiKey && config.projectId) {
    try {
      app = initializeApp(config);
      auth = getAuth(app);
      db = getFirestore(app);
      isFirebaseActive = true;
      console.log('🔥 Firebase initialized successfully!');
    } catch (err) {
      console.warn('⚠️ Firebase init failed, running in Local Storage Fallback mode.', err);
      isFirebaseActive = false;
    }
  } else {
    console.log('ℹ️ Firebase config not detected. Running in Local Storage Fallback mode.');
    isFirebaseActive = false;
  }
};

initFirebaseSystem();

export {
  app,
  auth,
  db,
  isFirebaseActive,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getSavedFirebaseConfig,
  STORAGE_KEY_CONFIG
};
