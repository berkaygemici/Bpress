"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Comment } from "@/types/content";
import CommentForm from "./CommentForm";
import { 
  ChatBubbleLeftIcon, 
  PencilIcon, 
  TrashIcon,
  EllipsisHorizontalIcon 
} from "@heroicons/react/24/outline";

type CommentDisplayProps = {
  comment: Comment;
  onCommentUpdated: () => void;
  level?: number;
};

export default function CommentDisplay({ comment, onCommentUpdated, level = 0 }: CommentDisplayProps) {
  const { user, firebaseUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.uid === comment.userId;
  const isAdmin = user?.role === "admin";
  const canModify = isOwner || isAdmin;
  const maxDepth = 3; // Limit reply depth

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        setError("Authentication failed. Please sign in again.");
        return;
      }

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update comment");
      }

      setShowEditForm(false);
      onCommentUpdated();
    } catch (error: any) {
      console.error("Error updating comment:", error);
      setError(error.message || "Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setLoading(true);

    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        setError("Authentication failed. Please sign in again.");
        return;
      }

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete comment");
      }

      onCommentUpdated();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      setError(error.message || "Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? "just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`${level > 0 ? "ml-8 border-l border-gray-200 pl-4" : ""}`}>
      <div className="rounded-lg bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-medium text-blue-600">
                  {comment.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt && " (edited)"}
                </p>
              </div>
            </div>

            {showEditForm ? (
              <form onSubmit={handleEdit} className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  maxLength={1000}
                  required
                />
                
                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !editContent.trim()}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditContent(comment.content);
                      setError(null);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-900">{comment.content}</p>
              </div>
            )}
          </div>

          {canModify && !showEditForm && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setShowEditForm(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!showEditForm && level < maxDepth && (
          <div className="mt-3 flex gap-4">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              Reply
            </button>
          </div>
        )}

        {showReplyForm && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <CommentForm
              postId={comment.postId}
              parentId={comment.id}
              onCommentAdded={() => {
                setShowReplyForm(false);
                onCommentUpdated();
              }}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
            />
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
