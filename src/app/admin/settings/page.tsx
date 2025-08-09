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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">General Settings</h1>
        <button onClick={onSave} disabled={saving} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Blog Title</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Your Blog"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Topic</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Main topic (e.g., Fitness, Home cooking, Investing)"
          />
        </label>
      </div>
      {/* Base Prompt removed – prompt is generated from Topic */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Frequency</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-800">Time (24h)</span>
          <input
            type="time"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>
    </main>
  );
}


