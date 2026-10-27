import OpenAI from "openai";

/**
 * Meta Model API client (OpenAI-compatible). Server-only - MODEL_API_KEY must
 * never be exposed to the browser.
 */
export function createMetaClient() {
  return new OpenAI({
    baseURL: "https://api.meta.ai/v1",
    apiKey: process.env.MODEL_API_KEY!,
  });
}

export const MODELS = {
  spark: "muse-spark-1.3",
  sam: "sam-3.1",
} as const;
