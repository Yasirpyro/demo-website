import { spawnSync } from 'node:child_process';
const result = spawnSync(
  process.execPath,
  [
    'node_modules/@playwright/test/cli.js',
    'test',
    'tests/e2e/offline.spec.ts',
    '--project=chromium',
    '--workers=1',
  ],
  { stdio: 'inherit', env: { ...process.env, REHEARSALS: '10' } },
);
process.exit(result.status ?? 1);
