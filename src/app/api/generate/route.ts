import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/services/openai";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { slugify } from "@/utils/slug";

const GenerateSchema = z.object({
  overrideTopic: z.string().optional(),
  overridePrompt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { overrideTopic, overridePrompt } = GenerateSchema.parse(body);

    const { db } = getFirebaseAdmin();
    const openai = getOpenAIClient();

    const settingsDoc = await db.collection("settings").doc("general").get();
    const settings = settingsDoc.data() as {
      topic?: string;
      basePrompt?: string;
    } | undefined;
    const topic = overrideTopic ?? settings?.topic ?? "";
    const basePrompt = overridePrompt ?? settings?.basePrompt ?? "";
    if (!topic || !basePrompt) {
      return NextResponse.json({ error: "Missing topic/basePrompt" }, { status: 400 });
    }

    // Build system/user prompt for JSON-only output
    const system = "You are an expert SEO blog writer. Output strictly JSON with keys: title, meta_description, tags (array), content (HTML with H tags), image_prompts (array of short image descriptions).";
    const user = `${basePrompt}\n\nTopic: ${topic}`;

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
    const parsed: {
      title: string;
      meta_description: string;
      tags: string[];
      content: string;
      image_prompts?: string[];
    } = JSON.parse(raw);

    const slug = slugify(parsed.title);
    const createdAt = Date.now();

    // Optionally: generate images with DALL·E and upload to Storage (skipped here for brevity)
    const images: string[] = [];

    const postData = {
      slug,
      title: parsed.title,
      metaDescription: parsed.meta_description,
      tags: parsed.tags ?? [],
      contentHtml: parsed.content,
      images,
      createdAt,
      status: "published" as const,
    };

    const docRef = await db.collection("posts").add(postData);
    return NextResponse.json({ id: docRef.id, ...postData });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


