import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0237298559",
  appId: "1:966600945191:web:85a025d3a63229d6f8e802",
  apiKey: "AIzaSyAqHpzNcAoBr3Uhg2fg1Dw-vCyS7HORzLI",
  authDomain: "gen-lang-client-0237298559.firebaseapp.com",
  databaseId: "ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e",
  storageBucket: "gen-lang-client-0237298559.firebasestorage.app",
  messagingSenderId: "966600945191",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
