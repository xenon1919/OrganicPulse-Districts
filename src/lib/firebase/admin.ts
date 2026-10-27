import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-only Admin SDK - used by API routes for privileged writes (recording
 * a collection awards points, tops up inventory, and runs the matching
 * agent, all across documents the acting user doesn't own). Lazily
 * initialized so a missing service account doesn't crash the build; it only
 * throws when an API route actually tries to use it without env vars set.
 */
let app: App | undefined;

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK is not configured - set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

// This project's Firestore database has the literal ID "default" (no
// parentheses) rather than the usual "(default)" - it was provisioned as a
// Firestore Enterprise-edition database, which apparently uses that ID.
// Confirmed via the REST API's databases.list; getFirestore() with no
// database id (which assumes "(default)") returns NOT_FOUND for this project.
const DATABASE_ID = "default";

export function getAdminDb() {
  return getFirestore(getAdminApp(), DATABASE_ID);
}
