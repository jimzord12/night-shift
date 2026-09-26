import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `npm run dev` serves the UI with hot reload and forwards /api to a running `night-shift view`.
// changeOrigin: the Viewer refuses requests whose Host is not its own address.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', emptyOutDir: true },
  server: { proxy: { '/api': { target: 'http://127.0.0.1:4747', changeOrigin: true } } },
});
