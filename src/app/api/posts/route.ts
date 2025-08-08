import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { z } from "zod";
import { slugify } from "@/utils/slug";

export async function GET() {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("posts")
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();
  const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ posts });
}

const PlaceholderSchema = z
  .object({
    title: z.string().optional(),
    metaDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .optional();

export async function POST(request: Request) {
  const { db } = getFirebaseAdmin();
  const body = await request.json().catch(() => ({}));
  const parsed = PlaceholderSchema.parse(body) ?? {};

  const title = parsed.title ?? "Placeholder Post Title";
  const metaDescription = parsed.metaDescription ?? "This is a placeholder meta description for an AI-generated blog post.";
  const tags = parsed.tags ?? ["placeholder", "ai", "blog"];
  const contentHtml = `<h1>${title}</h1><p>This is placeholder content. Real generated content will appear here later.</p><h2>Section heading</h2><p>More placeholder text to simulate structure.</p>`;

  const doc = {
    slug: slugify(`${title}-${Date.now()}`),
    title,
    metaDescription,
    tags,
    contentHtml,
    images: [] as string[],
    createdAt: Date.now(),
    status: "published" as const,
  };

  const ref = await db.collection("posts").add(doc);
  return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { db } = getFirebaseAdmin();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.collection("posts").doc(id).delete();
  return NextResponse.json({ ok: true });
}


