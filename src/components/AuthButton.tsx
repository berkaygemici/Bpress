"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import UserProfile from "./UserProfile";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign In
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="hidden sm:inline">{user.displayName || user.email}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => {
                setShowProfile(true);
                setShowDropdown(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Profile Settings
            </button>
            {user.role === "admin" && (
              <a
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Admin Panel
              </a>
            )}
          </div>
        )}
      </div>

      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
}
