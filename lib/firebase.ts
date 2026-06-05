import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  // @ts-ignore - getReactNativePersistence is exported at runtime but missing
  // from some @types bundles for firebase/auth.
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

/**
 * Firebase configuration.
 *
 * Values are read from public Expo env vars so no secrets are hard-coded.
 * Create a `.env` file in the project root (see `.env.example`) with your
 * Firebase web app config, then restart the dev server. Until configured,
 * `isFirebaseConfigured` is false and the UI shows a friendly notice instead
 * of crashing.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);

let auth: Auth | null = null;

if (isFirebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if already initialised (e.g. fast refresh).
    auth = getAuth(app);
  }
}

export { auth };
