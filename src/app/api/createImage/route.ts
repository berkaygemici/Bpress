import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/services/openai";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

const Input = z.object({
  imageText: z.string().min(8),
  pathPrefix: z.string().default("posts"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageText, pathPrefix } = Input.parse(body);
    console.log("[createImage] received", { pathPrefix, imageTextPreview: imageText.slice(0, 80) });
    const openai = getOpenAIClient();

    let b64: string | undefined;
    try {
      const res = await openai.images.generate({
        model: "gpt-image-1",
        prompt: imageText,
        n: 1,
        size: "1024x1024",
      });
      b64 = res.data?.[0]?.b64_json;
    } catch (e: unknown) {
      console.error("[createImage] openai.images.generate failed", e);
      const message = (e as Error).message || "OpenAI image generation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (!b64) return NextResponse.json({ error: "No image generated" }, { status: 400 });

    try {
      const { storage } = getFirebaseAdmin();
      const bucket = storage.bucket();
      const buffer = Buffer.from(b64, "base64");
      const token = uuidv4();
      const path = `${pathPrefix}/cover.png`;
      const file = bucket.file(path);
      await file.save(buffer, {
        contentType: "image/png",
        metadata: { metadata: { firebaseStorageDownloadTokens: token } },
      });
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
      return NextResponse.json({ url });
    } catch (e: unknown) {
      console.warn("[createImage] admin upload failed, returning dataUrl fallback", e);
      const dataUrl = `data:image/png;base64,${b64}`;
      return NextResponse.json({ dataUrl });
    }
  } catch (error: unknown) {
    console.error("[createImage] request failed", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}


