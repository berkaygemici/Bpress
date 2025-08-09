"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchPublishedPostsViaREST } from "@/services/firestoreRest";
import BlogHeader from "@/components/BlogHeader";
import BlogCard from "@/components/BlogCard";
import SearchAndFilter from "@/components/SearchAndFilter";
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

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchPublishedPostsViaREST(50);
        setPosts(rows as PostCard[]);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Extract all unique tags from posts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = selectedTag === null || 
        (Array.isArray(post.tags) && post.tags.includes(selectedTag));
      
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      
      <SearchAndFilter
        onSearch={setSearchQuery}
        onFilterByTag={setSelectedTag}
        availableTags={availableTags}
        selectedTag={selectedTag}
        searchQuery={searchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <LoadingSpinner size="lg" message="Loading amazing content..." />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.01-6-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No articles found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery || selectedTag 
                ? "Try adjusting your search or filter criteria to find what you're looking for."
                : "Looks like we haven't published any articles yet. Check back soon!"
              }
            </p>
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Show all articles
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results summary */}
            <div className="mb-8">
              <p className="text-gray-600">
                Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                {(searchQuery || selectedTag) && ` matching your criteria`}
              </p>
            </div>

            {/* Blog cards grid */}
            <div className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
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

            {/* Load more section (placeholder for future pagination) */}
            {filteredPosts.length >= 20 && (
              <div className="text-center mt-16">
                <div className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full border border-gray-200 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  More articles coming soon
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


