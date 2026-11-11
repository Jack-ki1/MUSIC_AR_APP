import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAqHpzNcAoBr3Uhg2fg1Dw-vCyS7HORzLI",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0237298559.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0237298559",
  appId: env.VITE_FIREBASE_APP_ID || "1:966600945191:web:85a025d3a63229d6f8e802",
  databaseId: env.VITE_FIREBASE_DATABASE_ID || "ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0237298559.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "966600945191",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
