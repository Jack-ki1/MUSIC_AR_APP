import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
        '/api/musicbrainz': {
          target: 'https://musicbrainz.org/ws/2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/musicbrainz/, ''),
          headers: {
            'User-Agent': 'BreakoutRadar/3.2 (aandr-intel@example.com)',
            'Accept': 'application/json',
          },
        },
        '/api/deezer': {
          target: 'https://api.deezer.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/deezer/, ''),
        },
      },
    },
  };
});
