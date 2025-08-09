import { getAuth, type Auth } from "firebase/auth";
import { getFirebase } from "./firebase";

export function getFirebaseAuth(): Auth {
  const { app } = getFirebase();
  return getAuth(app);
}




