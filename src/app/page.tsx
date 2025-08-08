import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold tracking-tight">AI-Powered Blog</h1>
      <p className="mt-2 text-gray-600">
        Go to <Link href="/admin" className="underline">/admin</Link> to configure topics, prompts and schedules.
      </p>
      <p className="mt-1 text-gray-600">View posts at <Link href="/blog" className="underline">/blog</Link>.</p>
    </main>
  );
}
