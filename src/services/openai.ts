import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.NEXT_GPT_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_GPT_KEY or OPENAI_API_KEY");
  }
  return new OpenAI({ apiKey });
}


