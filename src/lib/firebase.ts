// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAOjgtIDX8K7EmjG1dYmaUt7GiYtjk7m78",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "collage-event-a47a9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "collage-event-a47a9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "collage-event-a47a9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "603435622648",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:603435622648:web:517ef2ba7880f6374cdb0d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7CJ0DPBBEH",
};

// Initialize Firebase safely for Next.js SSR
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Database SDKs connected
export const db = app ? getFirestore(app) : null;
export const firestore = db; // Cloud Firestore Database
export const database = app ? getDatabase(app) : null; // Firebase Realtime Database
export const rtdb = database;

// Authentication & Cloud Storage SDKs
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;

// Initialize Analytics safely on client-side only
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
