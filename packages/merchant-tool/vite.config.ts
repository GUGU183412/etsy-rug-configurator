import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isStandalone = mode === 'standalone';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared/src'),
      },
    },
    server: {
      port: 3001,
      open: true,
    },
    build: isStandalone ? {
      outDir: 'dist-standalone',
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          entryFileNames: 'merchant-tool.js',
          assetFileNames: 'merchant-tool.[ext]',
        },
      },
    } : undefined,
  };
});
