import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

const deployingToNetlify = process.env.NETLIFY === 'true';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: deployingToNetlify ? netlify() : node({ mode: 'standalone' }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
