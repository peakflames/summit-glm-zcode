import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

// package.json#version is the single source of truth (AGENTS.md tool hygiene);
// the app reads it at build time via the __APP_VERSION__ global.
export default defineConfig({
  // GitHub Pages serves project pages from /<repo>/. The deploy workflow sets
  // GH_PAGES=true only for its build, so local `npm run build`/`preview` and
  // `npm run dev` are unaffected and keep serving from /.
  base: process.env.GH_PAGES === 'true' ? '/summit-glm-zcode/' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
