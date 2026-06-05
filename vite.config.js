import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'jsonwebtoken': path.resolve(__dirname, './backend/node_modules/jsonwebtoken'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  test: {
    server: {
      deps: {
        inline: ['jsonwebtoken'],
      },
    },
  },
});
