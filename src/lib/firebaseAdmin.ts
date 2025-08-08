import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

type AdminClients = {
  app: App;
  db: Firestore;
  storage: Storage;
};

export function getFirebaseAdmin(): AdminClients {
  const existing = getApps()[0];
  if (existing) {
    return { app: existing, db: getFirestore(existing), storage: getStorage(existing) };
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  const options: Parameters<typeof initializeApp>[0] & { credential?: ReturnType<typeof cert> } = {
    projectId,
    storageBucket,
  };
  if (serviceAccountJson) {
    // Only set credential if provided; avoid passing undefined which breaks initializeApp
    options.credential = cert(JSON.parse(serviceAccountJson));
  }
  const app = initializeApp(options);
  return { app, db: getFirestore(app), storage: getStorage(app) };
}


