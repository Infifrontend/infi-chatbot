import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';

  return {
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: isBuild
      ? {
          lib: {
            entry: path.resolve(__dirname, 'src/main.tsx'),
            name: 'ReactMF',
            fileName: () => 'chatbot.js',
            formats: ['iife'],
          },
          rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
            },
          },
        }
      : {},
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          sassOptions: {
            quietDeps: true,
          },
        },
      },
    },
  };
});
