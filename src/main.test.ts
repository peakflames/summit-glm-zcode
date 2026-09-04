import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// TOR-01-WqWceSw
// Given a browser console with no prior Summit records,
// When the Summit page loads (main.ts boot sequence runs),
// Then the first console record is "[INFO] Summit vX.Y.Z starting", emitted via console.info.
describe('startup log stamp', () => {
  it('first console record is the INFO startup line naming app and semantic version', async () => {
    const records: { level: string; text: string }[] = [];
    for (const level of ['debug', 'info', 'warn', 'error'] as const) {
      vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
        records.push({ level, text: args.map(String).join(' ') });
      });
    }

    // index.html body markup: present before the page "loads" (main.ts import).
    document.body.innerHTML = `
      <main class="shell">
        <header class="shell-header"><h1>Summit</h1></header>
        <section class="add-habit" aria-label="Add a habit">
          <input id="habit-name" name="habit-name" type="text" placeholder="Add habit" aria-label="Habit name" autocomplete="off" />
          <button id="add-habit" type="button">Add</button>
        </section>
        <section class="error-region" id="error-region" aria-label="Messages"></section>
        <section class="filter" id="filter" aria-label="Filter habits"></section>
        <section class="habit-list" id="habit-list" aria-label="Habit list"></section>
        <footer class="shell-footer" id="footer"></footer>
      </main>
    `;

    await import('./main');

    expect(records.length).toBeGreaterThan(0);
    const first = records[0]!;
    expect(first.level).toBe('info');
    expect(first.text).toMatch(/^\[INFO\] Summit v\d+\.\d+\.\d+ starting$/);

    const pkg = JSON.parse(readFileSync('package.json', 'utf-8')) as {
      version: string;
    };
    expect(first.text).toBe(`[INFO] Summit v${pkg.version} starting`);
  });
});
