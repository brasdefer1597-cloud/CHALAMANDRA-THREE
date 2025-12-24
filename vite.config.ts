import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      },
      build: {
        rollupOptions: {
          input: {
            sidepanel: path.resolve(__dirname, 'src/sidepanel/sidepanel.html'),
            welcome: path.resolve(__dirname, 'src/sidepanel/welcome.html'),
            background: path.resolve(__dirname, 'src/background/index.js'),
            content: path.resolve(__dirname, 'src/content/index.js')
          },
          output: {
            entryFileNames: 'src/[name]/index.js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]'
          }
        }
      }
    };
});
