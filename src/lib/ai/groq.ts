import { createGroq } from "@ai-sdk/groq";

/** Free key from https://console.groq.com/keys */
export function getGroqApiKey(): string | undefined {
  const key = process.env.GROQ_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function getGroqModel() {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  const groq = createGroq({ apiKey });
  return groq("llama-3.3-70b-versatile");
}
