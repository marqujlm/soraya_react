import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do Proxy Inverso de Alta Segurança para o Gemini
app.use(
  "/api/gemini",
  createProxyMiddleware({
    target: "https://generativelanguage.googleapis.com/v1beta",
    changeOrigin: true,
    pathRewrite: {
      "^/api/gemini": "", // Remove o /api/gemini do caminho antes de enviar pro Google
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Injeta a chave secreta silenciosamente antes de sair do Cloud Run
        if (process.env.VITE_GEMINI_API_KEY) {
          proxyReq.setHeader("x-goog-api-key", process.env.VITE_GEMINI_API_KEY);
        }
      },
    },
  })
);

app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    window.__RUNTIME_CONFIG__ = {
      VITE_FIREBASE_API_KEY: "${process.env.VITE_FIREBASE_API_KEY || ''}",
      VITE_FIREBASE_AUTH_DOMAIN: "${process.env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
      VITE_FIREBASE_PROJECT_ID: "${process.env.VITE_FIREBASE_PROJECT_ID || ''}",
      VITE_FIREBASE_STORAGE_BUCKET: "${process.env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
      VITE_FIREBASE_APP_ID: "${process.env.VITE_FIREBASE_APP_ID || ''}"
    };
  `);
});

// Configuração para servir os arquivos estáticos compilados do React
app.use(express.static(path.join(__dirname, "dist")));

// Todas as outras rotas (React Router SPA) devolvem o index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor de Producao rodando e escutando na porta ${PORT}...`);
});

