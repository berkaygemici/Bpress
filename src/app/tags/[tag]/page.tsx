"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchPublishedPostsViaREST } from "@/services/firestoreRest";

type PostCard = { id: string; slug: string; title: string; metaDescription: string; tags?: string[] };

export default function TagPage() {
  const params = useParams<{ tag: string }>();
  const tag = decodeURIComponent(params.tag || "");
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = (await fetchPublishedPostsViaREST(100)) as Array<{ id: string; slug: string; title: string; metaDescription: string; tags?: unknown[] }>;
      const filtered = all.filter((p) => Array.isArray(p.tags) && (p.tags as unknown[]).includes(tag));
      setPosts(filtered as PostCard[]);
      setLoading(false);
    })();
  }, [tag]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Tag: {tag}</h1>
      {loading ? (
        <p className="mt-4 text-gray-600">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="mt-4 text-gray-600">No posts found.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border rounded p-4">
              <Link href={`/blog/${post.slug}`} className="text-lg font-medium underline">
                {post.title}
              </Link>
              <p className="mt-1 text-gray-600">{post.metaDescription}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


