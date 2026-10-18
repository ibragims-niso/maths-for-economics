import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    // `npm run dev:proxy` runs the API locally on 8790; the app calls it on its own origin.
    proxy: { '/api': 'http://localhost:8790' },
  },
  plugins: [
    react(),
    VitePWA({
      // Phase 1: switch to 'prompt' so an update never reloads the page during a test.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Maths for Economics',
        short_name: 'Maths Econ',
        description: 'Free, offline-first app that teaches the mathematics of an economics degree.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FBFCFD',
        theme_color: '#FBFCFD',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole app shell, fonts included, so it opens with no network.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // API calls always go to the network; never answer them with the app page.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
});
