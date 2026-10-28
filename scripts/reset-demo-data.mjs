// Clears out transactional test/debug data (collections, matches, demand
// requests, inventory batches, green points ledger, caddy declarations) and
// renames the 3 existing demo accounts to realistic names, so the app is
// ready to record a clean demo from. Keeps the accounts themselves (they're
// tied to already-configured Firebase test phone numbers) and the hubs.
//
// Usage: node scripts/reset-demo-data.mjs

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
const db = getFirestore(app, "default");

async function deleteAll(collectionName) {
  const snap = await db.collection(collectionName).get();
  if (snap.empty) {
    console.log(`${collectionName}: already empty`);
    return;
  }
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`${collectionName}: deleted ${snap.size} doc(s)`);
}

for (const col of ["collections", "matches", "demandRequests", "inventoryBatches", "greenPointsLedger", "caddyDeclarations"]) {
  await deleteAll(col);
}

// Rename the 3 existing demo accounts to realistic names and reset the
// household's stats to a clean starting point.
const usersSnap = await db.collection("users").get();
const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

const household = users.find((u) => u.role === "household");
const partner = users.find((u) => u.role === "partner");
const receiver = users.find((u) => u.role === "receiver");

if (household) {
  await db.collection("users").doc(household.id).update({
    name: "Priya Rao",
    greenPoints: 0,
    tier: "Sprout",
  });
  console.log("Renamed household ->", "Priya Rao");
}
if (partner) {
  await db.collection("users").doc(partner.id).update({ name: "Malkajgiri Collection Point" });
  console.log("Renamed partner ->", "Malkajgiri Collection Point");
}
if (receiver) {
  await db.collection("users").doc(receiver.id).update({ name: "Deccan Organic Manure Co." });
  console.log("Renamed receiver ->", "Deccan Organic Manure Co.");
}

// Seed one active demand request per category for the receiver, so whichever
// category gets logged live during the demo recording immediately produces
// a real agentic match - this is the one thing the app has no UI for
// creating itself (demand requests only otherwise come from a direct
// marketplace claim, which needs inventory to already exist).
if (receiver) {
  const demand = [
    { category: "A", desiredKg: 2 },
    { category: "B", desiredKg: 1.5 },
    { category: "C", desiredKg: 3 },
  ];
  for (const d of demand) {
    await db.collection("demandRequests").add({
      receiverId: receiver.id,
      receiverName: receiver.name ?? "Deccan Organic Manure Co.",
      category: d.category,
      desiredKg: d.desiredKg,
      status: "active",
    });
  }
  console.log(`Seeded ${demand.length} active demand requests for the receiver.`);
}

console.log("\nDemo data reset complete.");
