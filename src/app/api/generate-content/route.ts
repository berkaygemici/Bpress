import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/services/openai";

const Input = z.object({
  topic: z.string().min(1),
  basePrompt: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, basePrompt } = Input.parse(body);

    const system = "You are an expert SEO blog writer. Output strictly JSON with keys: title, meta_description, tags (array), content (HTML with semantic H1/H2/H3), image_prompts (array).";
    const user = `${basePrompt}\n\nTopic: ${topic}`;

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


