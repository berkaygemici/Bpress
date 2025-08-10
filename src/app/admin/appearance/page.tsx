"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type SocialLink = {
  platform: 'linkedin' | 'twitter' | 'instagram';
  url: string;
  enabled: boolean;
};

type AppearanceSettings = {
  commentsEnabled?: boolean;
  footerText?: string;
  socialLinks?: SocialLink[];
  showSocialLinks?: boolean;
};

export default function AdminAppearancePage() {
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [footerText, setFooterText] = useState("© 2024 Blog. All rights reserved.");
  const [showSocialLinks, setShowSocialLinks] = useState(true);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'linkedin', url: '', enabled: false },
    { platform: 'twitter', url: '', enabled: false },
    { platform: 'instagram', url: '', enabled: false },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { db } = getFirebase();
      
      // Load general settings for comments
      const generalRef = doc(db, "settings", "general");
      const generalSnap = await getDoc(generalRef);
      const generalData = generalSnap.data() as { commentsEnabled?: boolean } | undefined;
      
      // Load footer settings
      const footerRef = doc(db, "settings", "footer");
      const footerSnap = await getDoc(footerRef);
      const footerData = footerSnap.data() as Omit<AppearanceSettings, 'commentsEnabled'> | undefined;
      
      setCommentsEnabled(generalData?.commentsEnabled ?? true);
      setFooterText(footerData?.footerText || "© 2024 Blog. All rights reserved.");
      setShowSocialLinks(footerData?.showSocialLinks ?? true);
      
      if (footerData?.socialLinks) {
        setSocialLinks(footerData.socialLinks);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async function onSave() {
    setSaving(true);
    try {
      const { db } = getFirebase();
      
      // Save comments setting to general settings
      const generalRef = doc(db, "settings", "general");
      await setDoc(generalRef, { commentsEnabled }, { merge: true });
      
      // Save footer settings
      const footerRef = doc(db, "settings", "footer");
      const footerPayload = {
        footerText,
        socialLinks,
        showSocialLinks,
      };
      await setDoc(footerRef, footerPayload, { merge: true });
      
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateSocialLink(index: number, field: keyof SocialLink, value: string | boolean) {
    setSocialLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Appearance Settings</h1>
          <p className="text-lg text-gray-600 mt-2">Customize your blog's look and functionality</p>
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
        {/* Comments Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">Enable Comments</h3>
              <p className="text-sm text-gray-600 mt-1">
                Allow visitors to comment on your blog posts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={commentsEnabled}
                onChange={(e) => setCommentsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Footer</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2024 Blog. All rights reserved."
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your social media presence</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showSocialLinks}
                onChange={(e) => setShowSocialLinks(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {showSocialLinks && (
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={link.platform} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-900 capitalize">
                      {link.platform}
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => updateSocialLink(index, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    placeholder={`https://${link.platform}.com/yourprofile`}
                    disabled={!link.enabled}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
