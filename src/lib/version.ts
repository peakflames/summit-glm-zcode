// Version plumbing — package.json#version is the single source of truth for the
// app version (AGENTS.md). The value is injected at build time by vite.config.ts;
// no other module may hardcode a version string.
export const APP_NAME = 'Summit';
export const APP_VERSION = __APP_VERSION__;
