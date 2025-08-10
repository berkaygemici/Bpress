"use client";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type BrandingSettings = {
  websiteName: string;
  logoUrl: string;
};

export function useBrandingSettings() {
  const [settings, setSettings] = useState<BrandingSettings>({
    websiteName: "Blog",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandingSettings();
  }, []);

  async function loadBrandingSettings() {
    try {
      const { db } = getFirebase();
      const ref = doc(db, "settings", "general");
      const snap = await getDoc(ref);
      const data = snap.data() as
        | {
            websiteName?: string;
            logoUrl?: string;
          }
        | undefined;

      setSettings({
        websiteName: data?.websiteName || "Blog",
        logoUrl: data?.logoUrl || "",
      });
    } catch (error) {
      console.error("Error loading branding settings:", error);
    } finally {
      setLoading(false);
    }
  }

  return { settings, loading, refresh: loadBrandingSettings };
}
