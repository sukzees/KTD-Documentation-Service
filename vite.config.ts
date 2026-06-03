import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import sharp from 'sharp';
import fs from 'fs';

// Generate standard PWA icons automatically during build and dev launch
try {
  const svgPath = path.resolve('public/pwa-icon.svg');
  const publicDir = path.resolve('public');
  if (fs.existsSync(svgPath)) {
    const icon192Path = path.join(publicDir, 'pwa-icon-192.png');
    const icon512Path = path.join(publicDir, 'pwa-icon-512.png');
    const iconMaskablePath = path.join(publicDir, 'pwa-icon-maskable.png');

    // Always generate or regenerate to guarantee sync
    sharp(svgPath).resize(192, 192).png().toFile(icon192Path)
      .then(() => console.log('✓ Generated pwa-icon-192.png'))
      .catch(err => console.error('Error rendering pwa-icon-192.png:', err));
      
    sharp(svgPath).resize(512, 512).png().toFile(icon512Path)
      .then(() => console.log('✓ Generated pwa-icon-512.png'))
      .catch(err => console.error('Error rendering pwa-icon-512.png:', err));
      
    sharp(svgPath).resize(512, 512).png().toFile(iconMaskablePath)
      .then(() => console.log('✓ Generated pwa-icon-maskable.png'))
      .catch(err => console.error('Error rendering pwa-icon-maskable.png:', err));
  }
} catch (e) {
  console.error("Failed to compile PWA icons automatically:", e);
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
