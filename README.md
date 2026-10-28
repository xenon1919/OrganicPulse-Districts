# OrganicPulse Districts

**A mobile-first circular-economy marketplace that turns sorted household waste into verified, AI-matched donations for local organic manure manufacturers and terrace gardeners.**

Built for the **Meta Global AI Developer Hackathon** (Indie Developer track, "Build for Your World").

🔗 **Live app**: [organicpulsedistricts.vercel.app](https://organicpulsedistricts.vercel.app)

---

## The problem

Households generate dry organic waste every week — eggshells, coffee/tea grounds, cardboard — that's perfect raw material for organic manure and composting, but has no easy path from a kitchen counter to someone who actually wants it. Meanwhile, small organic manure manufacturers and terrace gardeners pay for raw material they could be getting locally, for free, if there were a trustworthy way to connect the two sides.

OrganicPulse Districts closes that loop: households sort and log their dry waste, a neighborhood collection partner verifies and weighs it, and an AI agent routes it to the nearest receiver who actually wants it — with the receiver shown *why* they got the match, not just that they did.

## How Meta's models are used

This isn't a chatbot wrapper — two Meta models are load-bearing parts of the product:

- **SAM 3.1** (segmentation) is the trust layer. When a household logs a collection, they attach a photo of their sorted caddy. SAM 3.1 segments the photo against each declared category (eggshells / tea-coffee grounds / cardboard) and the system cross-checks the detected composition against what the household self-reported. A photo that doesn't match what was declared gets flagged for the collection partner to recheck — this is the project's anti-fraud mechanism, not a decorative AI feature.
- **Muse Spark** (`muse-spark-1.3`) is the actual matching agent. When a collection partner logs a new batch, Spark reasons over open inventory, active demand requests, and hub proximity, decides who the batch should route to, and writes a plain-language rationale that the receiver sees before they claim it ("why you got this match") — plus the push-notification copy.

Both run server-side via the Meta Model API (OpenAI-compatible `/v1` endpoint), with a graceful fallback if the API is ever unreachable so a flaky call never blocks a partner from recording a collection.

## What was built during the hackathon

Everything in this repository — there was no pre-existing codebase. Built solo across the hackathon's build window:

- Three role-based portals (Household / Collection Partner / Receiver) as a single installable PWA
- Phone/OTP authentication, Firestore data layer, Firebase Storage for caddy photos, and Firestore security rules
- The full SAM 3.1 + Muse Spark integration described above
- The Green Points gamification system (tiers, impact stats, carbon-saved estimate)
- All UI/UX, including a QR-pass + camera-scan flow (with a manual-entry fallback for camera failures) and a live, realtime inventory marketplace

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, installable PWA |
| Auth | Firebase Auth — phone/OTP |
| Data | Firestore (realtime listeners for the live marketplace + match notifications) |
| Files | Firebase Storage (caddy photos) |
| Privileged writes | Firebase Admin SDK via one Next.js API route (`/api/collections`) |
| AI | Meta Model API — `sam-3.1` (segmentation/verification), `muse-spark-1.3` (matching agent) |
| Hosting | Vercel |

## Core flow

1. **Household** taps to log what's going into their caddy (Calcium/eggshells, Nitrogen/tea-coffee, Carbon/cardboard) and attaches a photo, then shows their QR pass on collection day.
2. **Collection Partner** scans the QR (or enters the pass code manually), weighs the drop-off, and confirms — this triggers SAM 3.1 verification against the photo and awards the household Green Points.
3. Recording the collection also runs the **Muse Spark matching agent**, which finds the best-fit active demand and creates a proposed match with a written rationale.
4. **Receiver** sees the match with the agent's reasoning in their notifications feed (or browses the live marketplace directly) and taps to claim.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in Firebase + Meta Model API credentials
npm run dev
```

Firestore security rules live in `firestore.rules`, Storage rules in `storage.rules` (both need to be published from the Firebase Console — see comments in each file). `scripts/seed-hubs.mjs` seeds the initial neighborhood hubs via the Admin SDK on first setup.

## Team

Solo build — Indie Developer track.
