"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserIcon, PowerIcon } from "@heroicons/react/24/outline";

type UserProfileProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, signOut, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateUserProfile({ displayName: displayName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(user.displayName || "");
                  setError(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Display Name:</span>
                  <p className="text-gray-900">{user.displayName || "Not set"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Member since:</span>
                  <p className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-700 transition hover:bg-red-50"
              >
                <PowerIcon className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
