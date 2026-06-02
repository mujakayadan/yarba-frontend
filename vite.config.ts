import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const vendorChunk = (id: string): string | undefined => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  if (id.includes('animated-backgrounds')) {
    return 'animated-backgrounds';
  }
  if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
    return 'pdf';
  }
  if (id.includes('firebase')) {
    return 'firebase';
  }
  if (id.includes('@mui') || id.includes('@emotion')) {
    return 'mui';
  }
  if (id.includes('@tanstack/react-query')) {
    return 'query';
  }
  if (
    id.includes('react-dom') ||
    id.includes('react-router') ||
    id.includes('/react/') ||
    id.includes('\\react\\')
  ) {
    return 'react-vendor';
  }
  if (id.includes('lodash') || id.includes('axios') || id.includes('react-markdown')) {
    return 'utils';
  }

  return undefined;
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
