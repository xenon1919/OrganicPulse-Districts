// One-time setup: seeds the `hubs` collection via the Admin SDK, since
// firestore.rules intentionally blocks client writes to it (hubs are public
// reference data, not something any signed-in user should be able to edit).
//
// Usage: node scripts/seed-hubs.mjs
// Requires FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// in .env.local (same vars the Admin SDK uses at runtime).

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    if (!line.includes("=") || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx);
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

// Must match the DATABASE_ID in src/lib/firebase/admin.ts.
const db = getFirestore(app, "default");

const HUBS = [
  { name: "Malkajgiri Hub", neighborhood: "Malkajgiri", lat: 17.4556, lng: 78.5199 },
  { name: "Kompally Hub", neighborhood: "Kompally", lat: 17.5406, lng: 78.4898 },
];

const existing = await db.collection("hubs").get();
if (!existing.empty) {
  console.log(`hubs collection already has ${existing.size} doc(s) - skipping. Delete them first to reseed.`);
  process.exit(0);
}

for (const hub of HUBS) {
  const ref = await db.collection("hubs").add(hub);
  console.log(`Seeded ${hub.name} -> ${ref.id}`);
}
