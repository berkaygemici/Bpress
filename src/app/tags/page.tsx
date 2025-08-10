"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BlogHeader from "@/components/BlogHeader";
import { getFirebase } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type Tag = {
  name: string;
  count: number;
  posts: string[];
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      const { db } = getFirebase();
      const postsSnapshot = await getDocs(collection(db, "posts"));
      const tagCounts: Record<string, { count: number; posts: string[] }> = {};

      postsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach((tag: string) => {
            if (!tagCounts[tag]) {
              tagCounts[tag] = { count: 0, posts: [] };
            }
            tagCounts[tag].count++;
            tagCounts[tag].posts.push(doc.id);
          });
        }
      });

      const tagsArray = Object.entries(tagCounts)
        .map(([name, data]) => ({
          name,
          count: data.count,
          posts: data.posts,
        }))
        .sort((a, b) => b.count - a.count);

      setTags(tagsArray);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader 
        title="Browse by Tags" 
        subtitle="Explore content organized by topics" 
        compact 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tag.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag.count}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                </p>
              </Link>
            ))}
          </div>
        )}

        {!loading && tags.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714m0 0A5.002 5.002 0 0119 32a5.002 5.002 0 014.288 2.286m0 0A9.966 9.966 0 0134 32a9.966 9.966 0 0110.712 3.714" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tags will appear here once you have posts with tags.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
