// Generates the app icons in public/ from public/favicon.svg.
// Run after changing the logo: npm run generate-pwa-assets -w @mfe/web
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const paper = '#FBFCFD';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: paper } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: paper } },
  },
  images: ['public/favicon.svg'],
});
