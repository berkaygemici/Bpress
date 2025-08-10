"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type SEOSettings = {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  robotsTxt?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  openGraphImage?: string;
  twitterHandle?: string;
  enableSitemap?: boolean;
  enableRobotsTxt?: boolean;
};

export default function AdminSEOPage() {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [robotsTxt, setRobotsTxt] = useState("User-agent: *\nAllow: /");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState("");
  const [openGraphImage, setOpenGraphImage] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [enableSitemap, setEnableSitemap] = useState(true);
  const [enableRobotsTxt, setEnableRobotsTxt] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { db } = getFirebase();
      const ref = doc(db, "settings", "seo");
      const snap = await getDoc(ref);
      const data = snap.data() as SEOSettings | undefined;

      if (data) {
        setMetaTitle(data.metaTitle || "");
        setMetaDescription(data.metaDescription || "");
        setMetaKeywords(data.metaKeywords || "");
        setRobotsTxt(data.robotsTxt || "User-agent: *\nAllow: /");
        setGoogleAnalyticsId(data.googleAnalyticsId || "");
        setGoogleSearchConsoleId(data.googleSearchConsoleId || "");
        setOpenGraphImage(data.openGraphImage || "");
        setTwitterHandle(data.twitterHandle || "");
        setEnableSitemap(data.enableSitemap ?? true);
        setEnableRobotsTxt(data.enableRobotsTxt ?? true);
      }
    } catch (error) {
      console.error("Error loading SEO settings:", error);
    }
  }

  async function onSave() {
    setSaving(true);
    try {
      const { db } = getFirebase();
      const ref = doc(db, "settings", "seo");
      const payload: SEOSettings = {
        metaTitle,
        metaDescription,
        metaKeywords,
        robotsTxt,
        googleAnalyticsId,
        googleSearchConsoleId,
        openGraphImage,
        twitterHandle,
        enableSitemap,
        enableRobotsTxt,
      };
      await setDoc(ref, payload, { merge: true });
      alert("SEO settings saved successfully!");
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      alert("Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">SEO Settings</h1>
          <p className="text-lg text-gray-600 mt-2">Optimize your blog for search engines</p>
        </div>
        <button 
          onClick={onSave} 
          disabled={saving} 
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic SEO */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic SEO</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Your Blog - Latest Articles and Insights"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 50-60 characters. Currently: {metaTitle.length}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Discover fresh insights, quality content, and engaging articles on topics that matter to you."
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 150-160 characters. Currently: {metaDescription.length}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="blog, articles, insights, technology, lifestyle"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>
        </div>

        {/* Social Media & Open Graph */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media & Open Graph</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Open Graph Image URL
              </label>
              <input
                type="url"
                value={openGraphImage}
                onChange={(e) => setOpenGraphImage(e.target.value)}
                placeholder="https://yourblog.com/og-image.jpg"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended size: 1200x630 pixels
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Twitter Handle
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@yourblog"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include the @ symbol
              </p>
            </div>
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics & Tracking</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Google Search Console ID
              </label>
              <input
                type="text"
                value={googleSearchConsoleId}
                onChange={(e) => setGoogleSearchConsoleId(e.target.value)}
                placeholder="google-site-verification=..."
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Technical SEO */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical SEO</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">Enable XML Sitemap</h3>
                <p className="text-sm text-gray-600">Automatically generate sitemap for search engines</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSitemap}
                  onChange={(e) => setEnableSitemap(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">Enable Robots.txt</h3>
                <p className="text-sm text-gray-600">Control how search engines crawl your site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRobotsTxt}
                  onChange={(e) => setEnableRobotsTxt(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {enableRobotsTxt && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Robots.txt Content
                </label>
                <textarea
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
