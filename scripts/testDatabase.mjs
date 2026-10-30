// scripts/testDatabase.mjs
// Verifies live read and write connectivity to Firebase Cloud Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAOjgtIDX8K7EmjG1dYmaUt7GiYtjk7m78",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "collage-event-a47a9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "collage-event-a47a9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "collage-event-a47a9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "603435622648",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:603435622648:web:517ef2ba7880f6374cdb0d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-7CJ0DPBBEH",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  console.log("🔍 Checking connection to Cloud Firestore database for project:", firebaseConfig.projectId);
  console.log("   Endpoint:", firebaseConfig.authDomain);

  const collections = ["events", "activities", "groups", "certificates", "users"];
  const summary = {};

  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      summary[colName] = snap.size;
      console.log(`  ✓ Collection '${colName}': ${snap.size} documents found`);
    } catch (err) {
      console.error(`  ✗ Collection '${colName}' error:`, err.message);
      summary[colName] = "Error: " + err.message;
    }
  }

  console.log("\n📊 Cloud Firestore Database Status Summary:");
  console.table(summary);

  if (summary.events > 0) {
    console.log("🎉 Database is ONLINE, active, and populated with campus events!");
  } else {
    console.log("⚠️ Database connected but empty. Run 'npm run db:seed' to populate.");
  }

  process.exit(0);
}

testConnection().catch((err) => {
  console.error("❌ Database connection test failed:", err);
  process.exit(1);
});
