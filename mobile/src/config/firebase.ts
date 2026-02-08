import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
