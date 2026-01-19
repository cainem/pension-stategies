import { defineConfig } from 'vite';

export default defineConfig({
  // Base URL for GitHub Pages deployment
  base: '/pension-strategies/',
  
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  
  server: {
    port: 3000,
    open: true
  },
  
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js'
      ]
    }
  }
});
