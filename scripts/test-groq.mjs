import "dotenv/config";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const apiKey = process.env.GROQ_API_KEY?.trim();
if (!apiKey) {
  console.error("GROQ_API_KEY missing from .env");
  console.error("Get a free key: https://console.groq.com/keys");
  process.exit(1);
}

const groq = createGroq({ apiKey });

try {
  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: "Reply with exactly: ok",
    maxOutputTokens: 32,
  });
  console.log("Groq OK:", text.trim());
} catch (error) {
  console.error("Groq failed:");
  console.error(error?.message ?? error);
  if (error?.statusCode) console.error("status:", error.statusCode);
  process.exit(1);
}
