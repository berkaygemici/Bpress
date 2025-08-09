"use client";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/auth";
import Link from "next/link";
import { Cog6ToothIcon, HomeIcon, NewspaperIcon, PowerIcon } from "@heroicons/react/24/outline";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = getFirebaseAuth();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { email: u.email || "" } : null);
      setReady(true);
    });
    return () => unsub();
  }, [auth]);

  if (!ready) return <div className="grid min-h-screen place-items-center bg-gray-100 text-gray-800">Loading…</div>;

  if (!user) {
    async function login(e: React.FormEvent) {
      e.preventDefault();
      try {
        setError(null);
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        setError("Login failed");
      }
    }
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Admin Sign in</h1>
          <p className="text-sm text-gray-700">Enter your credentials to continue</p>
          <form onSubmit={login} className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:bg-black/90">
              Sign in
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white p-4 md:block">
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded bg-black" />
          <div>
            <p className="text-sm text-gray-500">AI Blog Admin</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <nav className="mt-6 space-y-1 text-sm">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-800">
            <HomeIcon className="h-5 w-5 text-gray-700" /> Dashboard
          </Link>
          <Link href="/admin/posts" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-800">
            <NewspaperIcon className="h-5 w-5 text-gray-700" /> Posts
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-800">
            <Cog6ToothIcon className="h-5 w-5 text-gray-700" /> Settings
          </Link>
        </nav>
        <button
          onClick={() => signOut(auth)}
          className="mt-6 flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
        >
          Sign out <PowerIcon className="h-4 w-4 text-gray-700" />
        </button>
      </aside>

      <header className="sticky top-0 z-10 ml-0 border-b border-gray-200 bg-white/80 backdrop-blur md:ml-64">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium text-gray-800">Admin</p>
          <div className="flex items-center gap-2 text-sm text-gray-800">
            <span className="hidden sm:inline font-medium">{user.email}</span>
            <div className="h-8 w-8 rounded-full bg-gray-300" />
          </div>
        </div>
      </header>

      <main className="ml-0 p-4 md:ml-64 md:p-6">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}


