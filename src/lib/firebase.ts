import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

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

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Initialize Analytics safely on client-side only
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
