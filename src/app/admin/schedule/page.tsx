"use client";
import { useState } from "react";

export default function AdminSchedulePage() {
  const [time, setTime] = useState("19:00");
  const [frequency, setFrequency] = useState("daily");

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Scheduling</h1>
      <label className="block">
        <span className="text-sm text-gray-700">Frequency</span>
        <select
          className="mt-1 w-full rounded border px-3 py-2"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
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
      <button className="rounded bg-black px-4 py-2 text-white">Save</button>
    </main>
  );
}


