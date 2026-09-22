import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wiresandstone.my.canva.site',
  output: 'static',
  build: {
    format: 'directory'
  },
  compressHTML: true,
  prefetch: {
    defaultStrategy: 'viewport'
  },
  vite: {
    build: {
      cssMinify: 'lightningcss'
    }
  }
});
