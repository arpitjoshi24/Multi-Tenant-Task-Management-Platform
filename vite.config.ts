import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ← this makes Vite accessible from outside the container
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
