"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth } from "@/lib/auth";
import { getFirebase } from "@/lib/firebase";
import { User, UserRole } from "@/types/content";

type AuthState = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
};

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<User, 'displayName'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getFirebaseAuth();
  const { db } = getFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            // User doesn't exist in Firestore, could be admin or needs migration
            // Check if they're an admin by trying to access admin collection
            try {
              const settingsDoc = await getDoc(doc(db, "settings", "general"));
              if (settingsDoc.exists()) {
                // If they can read settings, they're likely an admin
                const adminUser: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  displayName: firebaseUser.displayName || "",
                  role: "admin",
                  createdAt: Date.now(),
                  isActive: true,
                };
                await setDoc(doc(db, "users", firebaseUser.uid), adminUser);
                setUser(adminUser);
              } else {
                // Regular user - this shouldn't happen normally
                setUser(null);
              }
            } catch {
              // Can't access admin data, treat as regular user who needs to be created
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, db]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update Firebase profile
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    const newUser: User = {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      role: "user",
      createdAt: Date.now(),
      isActive: true,
    };
    
    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserProfile = async (updates: Partial<Pick<User, 'displayName'>>) => {
    if (!user || !firebaseUser) return;
    
    // Update Firebase profile
    if (updates.displayName !== undefined) {
      await updateProfile(firebaseUser, { displayName: updates.displayName });
    }
    
    // Update Firestore document
    const updatedUser = { ...user, ...updates };
    await setDoc(doc(db, "users", user.uid), updatedUser, { merge: true });
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAdmin: user?.role === "admin",
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
