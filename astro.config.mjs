// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://designedbyalok.com',
  trailingSlash: 'never',
  adapter: vercel(),
  // Nav restructure (Jul 2026): case studies moved from /projects/* to
  // /case-studies/*, and the personal products moved from /work/* to
  // /projects/*. Keep every previously shared URL alive.
  redirects: {
    '/projects/roots-design-system': '/case-studies/roots-design-system',
    '/projects/fold-rule-builder': '/case-studies/fold-rule-builder',
    '/projects/posture-canvas': '/case-studies/posture-canvas',
    '/projects/agent-builder': '/case-studies/agent-builder',
    '/projects/hcc-coding': '/case-studies/hcc-coding',
    '/projects/worklists': '/case-studies/worklists',
    '/work/writrpro': '/projects/writrpro',
    '/work/jobstax': '/projects/jobstax',
    // WriterPro used the slug "foldhealth"; local content is "fold-health".
    '/work/foldhealth': '/work/fold-health',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    domains: ['picsum.photos', 'fastly.picsum.photos'],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light-default',
      themes: {
        light: 'github-light-default',
        dark: 'github-dark-default',
      },
      wrap: true,
    },
  },
});
