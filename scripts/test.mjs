import { spawnSync } from 'node:child_process';
const result = spawnSync(
  process.execPath,
  ['node_modules/vitest/vitest.mjs', 'run', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: ((process.env.NODE_OPTIONS ?? '') + ' --no-experimental-webstorage').trim(),
    },
  },
);
process.exit(result.status ?? 1);
