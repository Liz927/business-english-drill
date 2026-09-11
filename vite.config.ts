import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Use /repository-name/ for a GitHub Pages project site; retain / locally.
const base = process.env.VITE_BASE_PATH || '/';
if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..')) {
  throw new Error('VITE_BASE_PATH must be an absolute path with a trailing slash.');
}

export default defineConfig({
  base,
  build: { target: 'safari15' },
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
    manifest: {
      name: 'Business English Drill', short_name: 'English Drill',
      description: 'Short daily practice for professional English.',
      theme_color: '#234c40', background_color: '#f7f6f2',
      display: 'standalone', start_url: base, scope: base, id: base, lang: 'en',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], navigateFallback: `${base}index.html` }
  })]
});
