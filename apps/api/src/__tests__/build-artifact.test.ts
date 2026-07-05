import { describe, it, expect } from 'vitest';
import './_setup';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

describe('build artifact (apps/api)', () => {
  it('dist/server.js exists after `npm run build:api`', () => {
    const dist = join(process.cwd(), 'dist', 'server.js');
    expect(existsSync(dist)).toBe(true);
  });

  it('dist/server.js is non-empty', () => {
    const dist = join(process.cwd(), 'dist', 'server.js');
    if (!existsSync(dist)) return; // skip if not built yet
    const stats = statSync(dist);
    expect(stats.size).toBeGreaterThan(1000);
  });
});

describe('build artifact (apps/web)', () => {
  it('dist/index.html exists after `npm run build:web`', () => {
    const dist = join(process.cwd(), '..', 'web', 'dist', 'index.html');
    expect(existsSync(dist)).toBe(true);
    if (existsSync(dist)) {
      const html = readFileSync(dist, 'utf8');
      expect(html).toContain('<div id="root">');
    }
  });
});
