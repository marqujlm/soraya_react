import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api/dify': {
          target: env.VITE_ENDPOINT_DIFY || 'https://api.dify.ai/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/dify/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (env.VITE_API_DIFY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_API_DIFY}`);
              }
            });
          }
        }
      }
    }
  }
})
