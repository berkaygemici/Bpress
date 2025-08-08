import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

const SettingsSchema = z.object({
  blogTitle: z.string(),
  topic: z.string(),
  basePrompt: z.string(),
  schedule: z.object({
    frequency: z.enum(["daily", "weekly"]),
    time: z.string().regex(/^\d{2}:\d{2}$/),
  }),
});

const SettingsUpdateSchema = z.object({
  blogTitle: z.string().optional(),
  topic: z.string().optional(),
  basePrompt: z.string().optional(),
  schedule: z
    .object({
      frequency: z.enum(["daily", "weekly"]).optional(),
      time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    })
    .optional(),
});

export async function GET() {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("settings").doc("general").get();
  return NextResponse.json(doc.data() ?? {}, { status: 200 });
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    const update = SettingsUpdateSchema.parse(payload);
    const { db } = getFirebaseAdmin();
    const ref = db.collection("settings").doc("general");
    const current = (await ref.get()).data() as z.infer<typeof SettingsSchema> | undefined;
    const merged: z.infer<typeof SettingsSchema> = {
      blogTitle: update.blogTitle ?? current?.blogTitle ?? "",
      topic: update.topic ?? current?.topic ?? "",
      basePrompt: update.basePrompt ?? current?.basePrompt ?? "",
      schedule: {
        frequency: update.schedule?.frequency ?? current?.schedule.frequency ?? "daily",
        time: update.schedule?.time ?? current?.schedule.time ?? "19:00",
      },
    };
    await ref.set(merged, { merge: true });
    return NextResponse.json({ ok: true, settings: merged });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}


