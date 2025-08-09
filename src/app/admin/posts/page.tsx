"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit, updateDoc } from "firebase/firestore";
import { slugify } from "@/utils/slug";
import { uploadDataUrlToStorage } from "@/services/images";

type Post = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  createdAt: number;
};

export default function AdminPostsPage() {
  const { db } = getFirebase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  async function load() {
    setLoading(true);
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      limit(10)
    );
    const snap = await getDocs(q);
    const rows: Post[] = snap.docs.map((d) => {
      const data = d.data() as { slug: string; title: string; metaDescription: string; createdAt: number };
      return { id: d.id, ...data };
    }).sort((a, b) => b.createdAt - a.createdAt);
    setPosts(rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createPlaceholder() {
    setCreating(true);
    await addDoc(collection(db, "posts"), {
      slug: `placeholder-${Date.now()}`,
      title: "Placeholder Post Title",
      metaDescription: "This is a placeholder meta description for an AI-generated blog post.",
      tags: ["placeholder", "ai", "blog"],
      contentHtml: `<h1>Placeholder Post Title</h1><p>This is placeholder content. Real generated content will appear here later.</p><h2>Section heading</h2><p>More placeholder text to simulate structure.</p>`,
      images: [],
      createdAt: Date.now(),
      status: "published",
    });
    setCreating(false);
    load();
  }

  async function generateViaGPT() {
    setGenLoading(true);
    try {
      // Fetch current settings topic only
      const settingsSnap = await getDocs(query(collection(db, "settings")));
      const settings = settingsSnap.docs.find((d) => d.id === "general")?.data() as
        | { topic?: string }
        | undefined;
      const topic = settings?.topic ?? "Swimming";

      // 1) Ask for a unique subject + content prompt first
      const subjectRes = await fetch("/api/subject-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!subjectRes.ok) throw new Error("Failed to find subject");
      const subjectData = (await subjectRes.json()) as { subject: string; contentPrompt: string };

      // 2) Generate content for that subject
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject: subjectData.subject, contentPrompt: subjectData.contentPrompt }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = (await res.json()) as {
        title?: string;
        meta_description?: string;
        tags?: string[];
        content?: string;
        imageText?: string;
      };
      const title = data.title ?? `AI Post ${Date.now()}`;
      const createdAt = Date.now();
      const slug = slugify(title, 6);
      const ref = await addDoc(collection(db, "posts"), {
        slug,
        title,
        metaDescription: data.meta_description ?? "",
        tags: data.tags ?? [],
        contentHtml: data.content ?? "",
        images: [] as string[],
        createdAt,
        status: "draft",
      });

      // Create header image from imageText
      const imgRes = await fetch("/api/createImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageText: data.imageText || `${title} cover photo`, pathPrefix: `posts/${ref.id}` }),
      });
      let finalImages: string[] = [];
      if (imgRes.ok) {
        const imgJson = (await imgRes.json()) as { url?: string; dataUrl?: string };
        if (imgJson.url) finalImages = [imgJson.url];
        else if (imgJson.dataUrl) {
          const uploaded = await uploadDataUrlToStorage(`posts/${ref.id}/cover.png`, imgJson.dataUrl);
          finalImages = [uploaded];
        }
      }

      await updateDoc(ref, { images: finalImages, status: "published" });
      load();
    } catch (e) {
      console.error(e);
      alert("Generation failed");
    } finally {
      setGenLoading(false);
    }
  }

  async function deletePost(id: string) {
    await deleteDoc(doc(db, "posts", id));
    load();
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={createPlaceholder}
            disabled={creating}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Placeholder"}
          </button>
          <button
            onClick={generateViaGPT}
            disabled={genLoading}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {genLoading ? "Generating..." : "Generate with GPT"}
          </button>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <a href={`/blog/${p.slug}`} className="line-clamp-2 text-base font-semibold text-gray-900 hover:underline">
                  {p.title}
                </a>
                <p className="mt-1 line-clamp-2 text-sm text-gray-700">{p.metaDescription}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                  <span>{new Date(p.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => deletePost(p.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


