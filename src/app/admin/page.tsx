export default function AdminHome() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Admin</h1>
        <p className="text-sm text-gray-700">Manage your AI blog configuration and content.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="/admin/settings" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <h2 className="text-base font-semibold text-gray-900">General Settings</h2>
          <p className="mt-1 text-sm text-gray-700">Blog title, topic, and schedule.</p>
        </a>
        <a href="/admin/schedule" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <h2 className="text-base font-semibold text-gray-900">Scheduling</h2>
          <p className="mt-1 text-sm text-gray-700">Automation time and frequency.</p>
        </a>
        <a href="/admin/posts" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <h2 className="text-base font-semibold text-gray-900">Posts</h2>
          <p className="mt-1 text-sm text-gray-700">Generate and manage posts.</p>
        </a>
      </div>
    </main>
  );
}


