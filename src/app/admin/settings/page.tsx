"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettingsPage() {
  const [blogTitle, setBlogTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
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
              basePrompt?: string;
              schedule?: { frequency?: "daily" | "weekly"; time?: string };
            }
          | undefined;
        setBlogTitle(data?.blogTitle ?? "");
        setTopic(data?.topic ?? "");
        setBasePrompt(data?.basePrompt ?? "");
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
        basePrompt,
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
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">General Settings</h1>
      <label className="block">
        <span className="text-sm text-gray-700">Blog Title</span>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={blogTitle}
          onChange={(e) => setBlogTitle(e.target.value)}
          placeholder="My AI Swim Blog"
        />
      </label>
      <label className="block">
        <span className="text-sm text-gray-700">Topic</span>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Swimming"
        />
      </label>
      <label className="block">
        <span className="text-sm text-gray-700">Base Prompt</span>
        <textarea
          className="mt-1 w-full rounded border px-3 py-2 min-h-[120px]"
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          placeholder="You are an expert writer..."
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-gray-700">Frequency</span>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as "daily" | "weekly")}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Time (24h)</span>
          <input
            type="time"
            className="mt-1 w-full rounded border px-3 py-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>
      <button onClick={onSave} disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-60">
        {saving ? "Saving..." : "Save"}
      </button>
    </main>
  );
}


