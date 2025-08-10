"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

type CommentFormProps = {
  postId: string;
  parentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
};

export default function CommentForm({ 
  postId, 
  parentId, 
  onCommentAdded, 
  onCancel,
  placeholder = "Share your thoughts..."
}: CommentFormProps) {
  const { user, firebaseUser } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-sm text-gray-600">
          {parentId ? "Sign in to reply to this comment" : "Sign in to share your thoughts"}
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Sign In to Comment
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        setError("Authentication failed. Please sign in again.");
        return;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          ...(parentId && { parentId }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post comment");
      }

      setContent("");
      onCommentAdded();
      onCancel?.();
    } catch (error: any) {
      console.error("Error posting comment:", error);
      setError(error.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={parentId ? 3 : 4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={1000}
          required
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Commenting as {user.displayName || user.email}</span>
          <span>{content.length}/1000</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
