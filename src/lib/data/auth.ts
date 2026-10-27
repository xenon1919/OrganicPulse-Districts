"use client";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuthClient, getDb } from "@/lib/firebase/client";
import { getHub } from "@/lib/data/household";
import type { ProfileRole, ReceiverType, UserProfile } from "@/types/database";

let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptcha(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(getAuthClient(), containerId, { size: "invisible" });
  }
  return recaptchaVerifier;
}

/** Sends an OTP to an E.164 phone number (e.g. "+919876543210"). */
export async function sendOtp(phoneE164: string, recaptchaContainerId: string): Promise<ConfirmationResult> {
  const verifier = getRecaptcha(recaptchaContainerId);
  return signInWithPhoneNumber(getAuthClient(), phoneE164, verifier);
}

/** Confirms the OTP and completes sign-in. Returns the Firebase uid. */
export async function confirmOtp(confirmation: ConfirmationResult, code: string): Promise<string> {
  const result = await confirmation.confirm(code);
  return result.user.uid;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function completeProfile(input: {
  uid: string;
  role: ProfileRole;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  hubId: string;
  receiverType?: ReceiverType;
}): Promise<UserProfile> {
  const hub = await getHub(input.hubId);

  const profile: Omit<UserProfile, "id"> = {
    role: input.role,
    name: input.name,
    phone: input.phone,
    address: input.address,
    pincode: input.pincode,
    hubId: input.hubId,
    hubName: hub?.name ?? null,
    receiverType: input.role === "receiver" ? (input.receiverType ?? "manufacturer") : null,
    greenPoints: 0,
    tier: "Sprout",
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(getDb(), "users", input.uid), profile);
  return { id: input.uid, ...profile };
}

export async function logOut(): Promise<void> {
  await signOut(getAuthClient());
}
