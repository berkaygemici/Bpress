export default function AdminHome() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <ul className="mt-4 list-disc pl-5 text-gray-700">
        <li>
          <a className="underline" href="/admin/settings">General Settings</a>
        </li>
        <li>
          <a className="underline" href="/admin/schedule">Scheduling</a>
        </li>
        <li>
          <a className="underline" href="/admin/posts">Posts</a>
        </li>
      </ul>
    </main>
  );
}


