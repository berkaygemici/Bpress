"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchPublishedPostsViaREST } from "@/services/firestoreRest";
import BlogCard from "@/components/BlogCard";
import LoadingSpinner from "@/components/LoadingSpinner";

type PostCard = { 
  id: string; 
  slug: string; 
  title: string; 
  metaDescription: string; 
  createdAt: number;
  tags?: string[];
  images?: string[];
};

export default function TagPage() {
  const params = useParams<{ tag: string }>();
  const tag = decodeURIComponent(params.tag || "");
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = (await fetchPublishedPostsViaREST(100)) as PostCard[];
        const filtered = all.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag));
        setPosts(filtered);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [tag]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </nav>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tag
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {tag}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore all articles tagged with "{tag}"
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSpinner size="lg" message="Loading articles..." />
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No articles found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any articles tagged with "{tag}". Try exploring other topics or check out our latest articles.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Explore All Articles
            </Link>
          </div>
        ) : (
          <>
            {/* Results summary */}
            <div className="mb-8">
              <p className="text-gray-600">
                Found {posts.length} article{posts.length !== 1 ? 's' : ''} tagged with "{tag}"
              </p>
            </div>

            {/* Articles grid */}
            <div className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.id}
                  slug={post.slug}
                  title={post.title}
                  metaDescription={post.metaDescription}
                  createdAt={post.createdAt}
                  tags={post.tags}
                  image={Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : undefined}
                />
              ))}
            </div>

            {/* Back to blog CTA */}
            <div className="text-center mt-16">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Explore More Articles
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}


