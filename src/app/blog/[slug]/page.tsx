"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebase } from "@/lib/firebase";
import { collection, getDocs, limit, query, where, orderBy } from "firebase/firestore";
import sanitize from "sanitize-html";
import LoadingSpinner from "@/components/LoadingSpinner";
import BlogSidebar from "@/components/BlogSidebar";
import CommentsSection from "@/components/CommentsSection";
import { fetchPublishedPostsViaREST } from "@/services/firestoreRest";

type PostDoc = {
  id?: string;
  title?: string;
  contentHtml?: string;
  metaDescription?: string;
  tags?: string[];
  images?: string[];
  createdAt?: number;
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const { db } = getFirebase();
  const [post, setPost] = useState<PostDoc | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [sidebarPosts, setSidebarPosts] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // Fetch main post
        const q = query(collection(db, "posts"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);
        const doc = snap.docs[0];
        const data = doc?.data() as PostDoc | undefined;
        setPost(data ?? null);
        setPostId(doc?.id ?? null);

        // Fetch sidebar content
        const allPosts = await fetchPublishedPostsViaREST(20);
        setSidebarPosts(allPosts as any[]);

        // Extract popular tags
        const tagCounts: { [key: string]: number } = {};
        allPosts.forEach((post: any) => {
          if (Array.isArray(post.tags)) {
            post.tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        const sortedTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .map(([tag]) => tag);
        setPopularTags(sortedTags);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [db, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" message="Loading article..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">
            The article you're looking for doesn't exist or may have been moved.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const safeHtml = sanitize(post.contentHtml || "", {
    allowedTags: sanitize.defaults.allowedTags.concat(["h1", "h2", "h3", "h4", "h5", "h6"]),
    allowedAttributes: { 
      ...sanitize.defaults.allowedAttributes,
      '*': ['class', 'id']
    },
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadTime = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed: 200 words per minute
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <header className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Article meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.createdAt || Date.now())}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {estimateReadTime(post.contentHtml || "")} min read
            </span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                BG
              </div>
              <span>Berkay Gemici</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Description */}
          {post.metaDescription && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl">
              {post.metaDescription}
            </p>
          )}

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Featured image */}
      {Array.isArray(post.images) && post.images.length > 0 && !imageError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative">
            <img
              src={post.images[0] as string}
              alt={post.title || "Cover image"}
              className="w-full aspect-[3/2] object-cover rounded-xl shadow-lg"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl" />
          </div>
        </div>
      )}

      {/* Main content area with sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article content */}
          <main className="lg:col-span-2">
            <article 
              className="prose prose-xl max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-li:text-gray-800"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {/* Share section */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Share this article</h3>
                  <p className="text-gray-600">Found this helpful? Share it with others!</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.title,
                          text: post.metaDescription,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <BlogSidebar 
                featuredPosts={sidebarPosts}
                popularTags={popularTags}
                currentPostId={post?.title ? sidebarPosts.find(p => p.title === post.title)?.id : undefined}
              />
            </div>
          </aside>
        </div>

        {/* Comments Section - Full Width */}
        {postId && (
          <div className="mt-16 border-t border-gray-200">
            <CommentsSection postId={postId} />
          </div>
        )}

        {/* Back to blog CTA */}
        <div className="mt-16 text-center">
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
      </div>
    </div>
  );
}


