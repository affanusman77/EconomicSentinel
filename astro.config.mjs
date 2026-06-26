// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const isKeystatic = !process.env.SKIP_KEYSTATIC;

const config = defineConfig({
  site: 'https://economicsentinel.org',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [react()],
});

if (isKeystatic) {
  const keystatic = (await import('@keystatic/astro')).default;
  config.integrations?.push(keystatic());

  const cloudflare = (await import('@astrojs/cloudflare')).default;
  config.adapter = cloudflare({ imageService: 'passthrough' });
}

export default config;
