import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Only enforce VITE_API_URL on production builds. The dev server falls back
  // to the proxy at `/api -> http://localhost:8787` defined below, which is
  // safe (not a user-facing URL).
  if (command === 'build') {
    const apiUrl = env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error(
        'VITE_API_URL is required for production builds. ' +
          'Set it to a branded custom domain (e.g. https://api.cypherofhealing.com/api). ' +
          'See CLAUDE.md hard constraint on .workers.dev URLs.',
      );
    }
    if (/\.workers\.dev/i.test(apiUrl)) {
      throw new Error(
        `VITE_API_URL must not point at *.workers.dev (got ${apiUrl}). ` +
          'Use the branded custom domain.',
      );
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
