"use client";
import { useState, useEffect, useCallback } from "react";
import { Comment } from "@/types/content";
import CommentForm from "./CommentForm";
import CommentDisplay from "./CommentDisplay";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

type CommentsSectionProps = {
  postId: string;
};

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/comments?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error("Failed to load comments");
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setError(error.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Organize comments into threads
  const organizeComments = (comments: Comment[]) => {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const topLevelComments: (Comment & { replies: Comment[] })[] = [];

    // First pass: create map with empty replies
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into threads
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  };

  const organizedComments = organizeComments(comments);

  const renderComment = (comment: Comment & { replies: Comment[] }, level = 0) => (
    <div key={comment.id} className="space-y-4">
      <CommentDisplay 
        comment={comment} 
        onCommentUpdated={fetchComments}
        level={level}
      />
      {comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map(reply => renderComment(reply, level + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                    <div className="h-16 w-full rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchComments}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <CommentForm 
            postId={postId} 
            onCommentAdded={fetchComments}
          />
        </div>

        {organizedComments.length > 0 ? (
          <div className="space-y-6">
            {organizedComments.map(comment => renderComment(comment))}
          </div>
        ) : (
          !loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <ChatBubbleLeftEllipsisIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to share your thoughts about this post.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
