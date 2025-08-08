"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFirebase } from "@/lib/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import sanitize from "sanitize-html";

type PostDoc = {
  title?: string;
  contentHtml?: string;
  tags?: string[];
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { db } = getFirebase();
  const [post, setPost] = useState<PostDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const q = query(collection(db, "posts"), where("slug", "==", slug), limit(1));
      const snap = await getDocs(q);
      const data = snap.docs[0]?.data() as PostDoc | undefined;
      setPost(data ?? null);
      setLoading(false);
    })();
  }, [db, slug]);

  if (loading) return <main className="mx-auto max-w-3xl p-6">Loading...</main>;
  if (!post) return <main className="mx-auto max-w-3xl p-6">Not found</main>;

  const safeHtml = sanitize(post.contentHtml || "", {
    allowedTags: sanitize.defaults.allowedTags.concat(["h1", "h2", "h3"]),
    allowedAttributes: { ...sanitize.defaults.allowedAttributes },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <article className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </main>
  );
}


