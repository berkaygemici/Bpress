import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/services/openai";
import { fetchPublishedPostsViaREST } from "@/services/firestoreRest";

const Input = z.object({ topic: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = Input.parse(body);

    const recent = (await fetchPublishedPostsViaREST(4)) as Array<{ title?: unknown }>;
    const recentTitles = recent
      .map((p) => (typeof p.title === "string" ? p.title : ""))
      .filter((t): t is string => t.length > 0);

    const system =
      "You are a creative, reliable SEO editor. Suggest a unique, marketable subject under the main Topic that avoids overlap with the provided recentTitles. Then produce a strong, well-structured prompt to generate content for that subject. Output STRICT JSON with keys ONLY: subject (string), contentPrompt (string).";
    const user = JSON.stringify({ topic, recentTitles }, null, 2);

    const openai = getOpenAIClient();
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = chat.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { subject: string; contentPrompt: string };
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}


