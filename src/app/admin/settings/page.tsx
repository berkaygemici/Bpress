"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettingsPage() {
  const [blogTitle, setBlogTitle] = useState("");
  const [topic, setTopic] = useState("");
  // Base prompt removed; generation derives its own prompt from Topic
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [time, setTime] = useState("19:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { db } = getFirebase();
        const ref = doc(db, "settings", "general");
        const snap = await getDoc(ref);
        const data = snap.data() as
          | {
              blogTitle?: string;
              topic?: string;
              schedule?: { frequency?: "daily" | "weekly"; time?: string };
            }
          | undefined;
        setBlogTitle(data?.blogTitle ?? "");
        setTopic(data?.topic ?? "");
        setFrequency((data?.schedule?.frequency as "daily" | "weekly") ?? "daily");
        setTime(data?.schedule?.time ?? "19:00");
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    })();
  }, []);

  async function onSave() {
    setSaving(true);
    try {
      const { db } = getFirebase();
      const ref = doc(db, "settings", "general");
      const payload = {
        blogTitle,
        topic,
        schedule: { frequency, time },
      };
      await setDoc(ref, payload, { merge: true });
    } catch (e) {
      console.error("Failed to save settings", e);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">General Settings</h1>
          <p className="text-lg text-gray-600 mt-2">Configure your blog preferences</p>
        </div>
        <button onClick={onSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-base font-semibold text-gray-900">Blog Title</span>
            <input
              className="mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder="Your Blog"
            />
          </label>
          <label className="block">
            <span className="text-base font-semibold text-gray-900">Topic</span>
            <input
              className="mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Main topic (e.g., Fitness, Home cooking, Investing)"
            />
          </label>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-base font-semibold text-gray-900">Frequency</span>
              <select
                className="mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            <label className="block">
              <span className="text-base font-semibold text-gray-900">Time (24h)</span>
              <input
                type="time"
                className="mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}


