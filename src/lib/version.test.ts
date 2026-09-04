import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_NAME, APP_VERSION } from './version';

// TOR-01-QdBg1u6
// Given the application is built with package.json#version = X.Y.Z,
// When APP_VERSION is read,
// Then it equals the version field of package.json (the single source of truth),
// And the composed startup/footer string uses exactly that value.
describe('version single source of truth', () => {
  it('APP_VERSION equals package.json#version', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as {
      version: string;
    };
    expect(APP_VERSION).toBe(pkg.version);
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('composes the "Summit vX.Y.Z" display string from the single source', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as {
      version: string;
    };
    expect(`${APP_NAME} v${APP_VERSION}`).toBe(`Summit v${pkg.version}`);
  });
});
