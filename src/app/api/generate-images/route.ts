import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/services/openai";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

const Input = z.object({
  prompts: z.array(z.string()).min(1),
  pathPrefix: z.string().default("posts"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompts, pathPrefix } = Input.parse(body);
    const openai = getOpenAIClient();

    // Generate images via OpenAI (base64)
    const b64s: string[] = [];
    for (const prompt of prompts) {
      const res = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
      });
      const b64 = res.data?.[0]?.b64_json;
      if (b64) b64s.push(b64);
    }

    // Try uploading with Firebase Admin (preferred)
    try {
      const { storage } = getFirebaseAdmin();
      const bucket = storage.bucket();
      const urls: string[] = [];
      let index = 0;
      for (const b64 of b64s) {
        const buffer = Buffer.from(b64, "base64");
        const path = `${pathPrefix}/img_${index++}.png`;
        const token = uuidv4();
        const file = bucket.file(path);
        await file.save(buffer, {
          contentType: "image/png",
          metadata: { metadata: { firebaseStorageDownloadTokens: token } },
        });
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          path
        )}?alt=media&token=${token}`;
        urls.push(url);
      }
      return NextResponse.json({ urls });
    } catch {
      // Fallback: return data URLs for client upload
      const dataUrls = b64s.map((b64) => `data:image/png;base64,${b64}`);
      return NextResponse.json({ dataUrls });
    }
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}



