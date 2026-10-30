// TEST-ONLY: builds the app against tests/fixtures/stubBackend.js so screens can be screenshotted without Firebase.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: [{ find: /^.*\/firebaseBackend\.js$/, replacement: fileURLToPath(new URL('./tests/fixtures/stubBackend.js', import.meta.url)) }] },
  build: { outDir: 'dist-visual', emptyOutDir: true },
});
