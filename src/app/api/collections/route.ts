import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyCaddyPhoto, runMatchingAgent } from "@/lib/data/ai";
import type { Category, Collection } from "@/types/database";

const POINTS_PER_KG = 15;
const CATEGORIES: Category[] = ["A", "B", "C"];

interface RequestBody {
  partnerId: string;
  householdId: string;
  hubId: string;
  weights: { A: number; B: number; C: number };
}

export async function POST(req: Request) {
  const body = (await req.json()) as RequestBody;
  const { partnerId, householdId, hubId, weights } = body;

  if (!partnerId || !householdId || !hubId || !weights) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const adminDb = getAdminDb();

  const [householdSnap, hubSnap, caddySnap] = await Promise.all([
    adminDb.collection("users").doc(householdId).get(),
    adminDb.collection("hubs").doc(hubId).get(),
    adminDb.collection("caddyDeclarations").doc(householdId).get(),
  ]);

  if (!householdSnap.exists) {
    return NextResponse.json({ error: "Household not found." }, { status: 404 });
  }

  const household = householdSnap.data()!;
  const hub = hubSnap.data();
  const caddy = caddySnap.exists ? caddySnap.data()! : null;

  const declared = {
    A: caddy?.categoryAKg ?? weights.A,
    B: caddy?.categoryBKg ?? weights.B,
    C: caddy?.categoryCKg ?? weights.C,
  };
  const samVerification = await verifyCaddyPhoto(declared);

  const totalKg = weights.A + weights.B + weights.C;
  const pointsAwarded = Math.round(totalKg * POINTS_PER_KG);
  const collectedAt = new Date().toISOString();

  const collectionRef = adminDb.collection("collections").doc();
  const collectionDoc: Omit<Collection, "id"> = {
    householdId,
    householdName: household.name ?? "Household",
    hubId,
    hubName: hub?.name ?? "Hub",
    categoryAKg: weights.A,
    categoryBKg: weights.B,
    categoryCKg: weights.C,
    photoUrl: caddy?.photoUrl ?? null,
    samVerification,
    collectedAt,
    verifiedBy: partnerId,
  };

  const batchWrite = adminDb.batch();
  batchWrite.set(collectionRef, collectionDoc);
  batchWrite.delete(adminDb.collection("caddyDeclarations").doc(householdId));
  batchWrite.update(adminDb.collection("users").doc(householdId), {
    greenPoints: FieldValue.increment(pointsAwarded),
  });
  batchWrite.set(adminDb.collection("greenPointsLedger").doc(), {
    householdId,
    points: pointsAwarded,
    reason: `Collection drop-off (${totalKg.toFixed(2)}kg)`,
    createdAt: collectedAt,
  });
  await batchWrite.commit();

  // Top up hub inventory per category (find the open batch for this
  // hub+category, or create one).
  for (const cat of CATEGORIES) {
    const kg = weights[cat];
    if (kg <= 0) continue;

    const existing = await adminDb
      .collection("inventoryBatches")
      .where("hubId", "==", hubId)
      .where("category", "==", cat)
      .where("status", "==", "open")
      .limit(1)
      .get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({ availableKg: FieldValue.increment(kg) });
    } else {
      await adminDb.collection("inventoryBatches").add({
        hubId,
        hubName: hub?.name ?? "Hub",
        neighborhood: hub?.neighborhood ?? "",
        category: cat,
        availableKg: kg,
        status: "open",
        createdAt: collectedAt,
      });
    }
  }

  await runMatchingPass(hubId);

  const collection: Collection = { id: collectionRef.id, ...collectionDoc };
  return NextResponse.json({ collection, pointsAwarded });
}

/**
 * Agentic matching pass: for each open batch at the hub with volume, find
 * the oldest active demand request in the same category that doesn't
 * already have a live match, and ask the agent to reason about routing it.
 * See src/lib/data/ai.ts for where this swaps to a real Muse Spark call.
 */
async function runMatchingPass(hubId: string) {
  const adminDb = getAdminDb();

  const batchesSnap = await adminDb
    .collection("inventoryBatches")
    .where("hubId", "==", hubId)
    .where("status", "==", "open")
    .get();

  for (const batchDoc of batchesSnap.docs) {
    const batch = batchDoc.data();
    if (!batch.availableKg || batch.availableKg <= 0) continue;

    const demandSnap = await adminDb
      .collection("demandRequests")
      .where("category", "==", batch.category)
      .where("status", "==", "active")
      .get();

    let chosenDemand: FirebaseFirestore.QueryDocumentSnapshot | null = null;
    for (const demandDoc of demandSnap.docs) {
      const liveMatch = await adminDb
        .collection("matches")
        .where("demandRequestId", "==", demandDoc.id)
        .where("status", "in", ["proposed", "claimed"])
        .limit(1)
        .get();
      if (liveMatch.empty) {
        chosenDemand = demandDoc;
        break;
      }
    }
    if (!chosenDemand) continue;

    const demand = chosenDemand.data();
    const { rationale } = await runMatchingAgent({
      category: batch.category,
      availableKg: batch.availableKg,
      receiverName: demand.receiverName ?? "a nearby receiver",
      desiredKg: demand.desiredKg,
      hubName: batch.hubName ?? "the hub",
    });

    await adminDb.collection("matches").add({
      inventoryBatchId: batchDoc.id,
      demandRequestId: chosenDemand.id,
      category: batch.category,
      availableKg: batch.availableKg,
      hubName: batch.hubName,
      receiverId: demand.receiverId,
      agentRationale: rationale,
      status: "proposed",
      matchedAt: new Date().toISOString(),
    });
  }
}
