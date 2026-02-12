import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCOaXuhqJtjnaz-37z0fuT147rsUR9M4vg",
  authDomain: "velocity-769e6.firebaseapp.com",
  projectId: "velocity-769e6",
  storageBucket: "velocity-769e6.firebasestorage.app",
  messagingSenderId: "447177992895",
  appId: "1:447177992895:web:d38cd5096cb91acb11f40a",
  measurementId: "G-3H2SEPZZWM"
};

// Initialize Firebase only if not already initialized
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage for persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize Firestore with optimized settings for React Native
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Better for React Native
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  });
} catch (error) {
  // If Firestore is already initialized, get the existing instance
  db = getFirestore(app);
}

export { auth, db };
export const storage = getStorage(app);

export default app;
