"use client";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/auth";

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

  if (!ready) return <div className="p-6">Loading...</div>;

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
      <main className="mx-auto max-w-sm p-6">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <form onSubmit={login} className="mt-4 space-y-3">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded bg-black px-4 py-2 text-white">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between border-b p-4">
        <nav className="text-sm space-x-4">
          <a href="/admin" className="underline">Home</a>
          <a href="/admin/settings" className="underline">Settings</a>
          <a href="/admin/posts" className="underline">Posts</a>
        </nav>
        <button className="text-sm underline" onClick={() => signOut(auth)}>Sign out</button>
      </header>
      {children}
    </div>
  );
}


