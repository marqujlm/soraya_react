import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Suas configurações do Firebase (você vai pegar no Console do Firebase)
// Cole as credenciais no seu arquivo .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "VITE_FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "VITE_FIREBASE_PROJECT_ID_PLACEHOLDER",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "VITE_FIREBASE_STORAGE_BUCKET_PLACEHOLDER",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "VITE_FIREBASE_APP_ID_PLACEHOLDER"
};

console.log("🔥 Firebase Config Variables:", {
  apiKey: firebaseConfig.apiKey ? "PREENCHIDA" : "VAZIA (ERRO)",
  projectId: firebaseConfig.projectId ? "PREENCHIDA" : "VAZIA (ERRO)"
});

let app;
let auth;
let db;

try {
  if (!firebaseConfig.apiKey) {
    throw new Error("apiKey do Firebase vazia no Build. Verifique os build args do Railway.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("🔥 ERRO FATAL: Falha ao inicializar o Firebase. As variáveis de ambiente provavelmente estão vazias no Build do Docker.", error);
}

export { auth, db };