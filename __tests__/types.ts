import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

// Runtime-only stack substitutions retain the lockfile's React declaration version.
// Source types are checked here; test:package checks all emitted declarations
// with matching consumer dependencies and skipLibCheck disabled.
it('checks route inference and rejected calls', () => {
  const output = execFileSync(
    process.execPath,
    [resolve('node_modules/typescript/bin/tsc'), '--project', '__type_tests__/tsconfig.json'],
    { encoding: 'utf8', timeout: 10_000 },
  );

  expect(output).toBe('');
}, 15_000);
