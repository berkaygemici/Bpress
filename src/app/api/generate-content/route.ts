import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/services/openai";

const Input = z.object({
  topic: z.string().min(1),
  subject: z.string().optional(),
  contentPrompt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, subject, contentPrompt } = Input.parse(body);

    const system = "You are an expert swim coach and SEO editor. Write a high-quality article for the provided Subject under the main Topic, then provide ONE header image description. Output STRICT JSON: title, meta_description, tags (array), content (HTML with exactly one H1 and multiple H2/H3; short paragraphs and lists), imageText (string). No extra text.";
    const user = `Topic: ${topic}\nSubject: ${subject || "(derive a good subject)"}\nContentPrompt: ${contentPrompt || "(derive a strong prompt factoring uniqueness and marketability)"}\nAudience: adult swimmers (beginners to intermediate), triathletes, and masters.\nConstraints: 1200-1600 words; actionable drills/workouts; safety notes; avoid fluff; E-E-A-T; no medical claims.`;

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
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}


