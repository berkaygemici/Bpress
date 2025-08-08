"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebase } from "@/lib/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

type PostCard = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  createdAt: number;
};

export default function BlogIndexPage() {
  const { db } = getFirebase();
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "posts"), where("status", "==", "published"), limit(20));
      const snap = await getDocs(q);
      const rows: PostCard[] = snap.docs
        .map((d) => {
          const data = d.data() as { slug: string; title: string; metaDescription: string; createdAt: number };
          return { id: d.id, ...data } as PostCard;
        })
        .sort((a, b) => b.createdAt - a.createdAt);
      setPosts(rows);
      setLoading(false);
    })();
  }, [db]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Blog</h1>
      {loading ? (
        <p className="mt-4 text-gray-600">Loading...</p>
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


