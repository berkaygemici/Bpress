import { getFirebase } from "@/lib/firebase";
import { getDownloadURL, getStorage, ref, uploadString } from "firebase/storage";

// Placeholder generator: returns remote placeholder URLs (no upload). Replace later with your CF URL.
export async function generatePlaceholderImages(prompts: string[], width = 1200, height = 630): Promise<string[]> {
  return prompts.slice(0, 4).map((p, i) => `https://placehold.co/${width}x${height}?text=${encodeURIComponent(p || `Image ${i + 1}`)}`);
}

// Helper to upload a base64 data URL to Firebase Storage and return a download URL
export async function uploadDataUrlToStorage(path: string, dataUrl: string): Promise<string> {
  const { app } = getFirebase();
  const storage = getStorage(app);
  const objectRef = ref(storage, path);
  await uploadString(objectRef, dataUrl, "data_url");
  return await getDownloadURL(objectRef);
}




