import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/** GitHub Pages project site: https://<user>.github.io/ivebeenthere/ */
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
