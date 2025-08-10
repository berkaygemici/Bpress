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
  
  // Branding settings
  const [websiteName, setWebsiteName] = useState("Blog");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

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
              websiteName?: string;
              logoUrl?: string;
              schedule?: { frequency?: "daily" | "weekly"; time?: string };
            }
          | undefined;
        setBlogTitle(data?.blogTitle ?? "");
        setTopic(data?.topic ?? "");
        setWebsiteName(data?.websiteName ?? "Blog");
        setLogoUrl(data?.logoUrl ?? "");
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
        websiteName,
        logoUrl,
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

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setLogoUrl(data.logoUrl);
      } else {
        alert(data.error || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  }

  function removeLogo() {
    setLogoUrl("");
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
      <div className="mt-6 space-y-8">
        {/* Branding Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Branding</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-base font-semibold text-gray-900">Website Name</span>
              <input
                className="mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="Your Website Name"
              />
            </label>
            
            <div className="block">
              <span className="text-base font-semibold text-gray-900 block mb-2">Website Logo</span>
              
              {logoUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={logoUrl} 
                      alt="Website Logo" 
                      className="h-16 w-auto max-w-32 rounded-lg border border-gray-200 object-contain bg-white p-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={logoUploading}
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        {logoUploading ? "Uploading..." : "Replace Logo"}
                      </span>
                    </label>
                    <button
                      onClick={removeLogo}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded"></div>
                  <p className="text-gray-600 mb-4">Upload a logo for your website</p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={logoUploading}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      {logoUploading ? "Uploading..." : "Upload Logo"}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blog Content Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Blog Content</h2>
          
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
        </div>
        
        {/* Publishing Schedule Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Publishing Schedule</h2>
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


