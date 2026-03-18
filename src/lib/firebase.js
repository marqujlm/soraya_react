import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Suas configurações do Firebase (você vai pegar no Console do Firebase)
// Cole as credenciais no seu arquivo .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
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
    throw new Error("apiKey do Firebase está vazia!");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase inicializado com sucesso.");
} catch (error) {
  console.error("🔥 ERRO FATAL: Falha ao inicializar o Firebase. As variáveis de ambiente estão vazias no momento do Build.", error);
}

export { app, auth, db };