"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit } from "firebase/firestore";

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
      // Fetch current settings to build inputs
      const settingsSnap = await getDocs(query(collection(db, "settings")));
      const settings = settingsSnap.docs.find((d) => d.id === "general")?.data() as
        | { topic?: string; basePrompt?: string }
        | undefined;
      const topic = settings?.topic ?? "General";
      const basePrompt = settings?.basePrompt ?? "Write a helpful, SEO-friendly article.";

      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, basePrompt }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = (await res.json()) as {
        title?: string;
        meta_description?: string;
        tags?: string[];
        content?: string;
      };
      const title = data.title ?? `AI Post ${Date.now()}`;
      await addDoc(collection(db, "posts"), {
        slug: `ai-${Date.now()}`,
        title,
        metaDescription: data.meta_description ?? "",
        tags: data.tags ?? [],
        contentHtml: data.content ?? "",
        images: [],
        createdAt: Date.now(),
        status: "published",
      });
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
        <h1 className="text-2xl font-semibold">Posts</h1>
        <button
          onClick={createPlaceholder}
          disabled={creating}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Placeholder Post"}
        </button>
      </div>
      <div className="mt-3">
        <button
          onClick={generateViaGPT}
          disabled={genLoading}
          className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {genLoading ? "Generating..." : "Generate with GPT"}
        </button>
      </div>
      <div className="mt-4">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <ul className="divide-y">
            {posts.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <a href={`/blog/${p.slug}`} className="font-medium underline">
                    {p.title}
                  </a>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.metaDescription}</p>
                </div>
                <button
                  onClick={() => deletePost(p.id)}
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}


